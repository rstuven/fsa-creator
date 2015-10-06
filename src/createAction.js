import validator from 'is-my-json-valid';

function identity(value) {
  return value;
}

function isValidator(spec) {
  return typeof spec === 'object' && !(spec instanceof Array);
}

function validatedIdentity(schema, name) {
  const validate = validator(schema);
  return value => {
    if (validate(value)) {
      return value;
    }
    const { field, message } = validate.errors[0];
    return new Error(`${field.replace(/^data/, name)} ${message}`);
  };
}

function propertyCreator(spec, name) {
  if (typeof spec === 'boolean') {
    return spec ? identity : undefined;
  }
  if (typeof spec === 'function') {
    return spec;
  }
  if (typeof spec === 'object' && spec instanceof Array) {
    return (data) => spec.reduce((res, prop) => {
      res[prop] = data[prop];
      return res;
    }, {});
  }
  if (isValidator(spec)) {
    return validatedIdentity(spec, name);
  }
}

export default function createAction(type, payloadSpec, metaSpec) {
  const payloadCreator = propertyCreator(payloadSpec, 'payload');
  const metaCreator = propertyCreator(metaSpec, 'meta');

  function actionCreator(payload, meta) {
    const action = { type };
    if (typeof payloadCreator === 'function') {
      action.payload = payloadCreator(payload);
      if (action.payload instanceof Error) {
        action.error = true;
      }
    }
    if (typeof metaCreator === 'function') {
      action.meta = metaCreator(meta);
    }
    return action;
  }

  actionCreator.toString = () => type;

  return actionCreator;
}
