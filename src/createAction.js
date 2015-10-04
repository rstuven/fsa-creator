import validator from 'is-my-json-valid';

function identity(value) {
  return value;
}

function isValidator(input) {
  return typeof input === 'object' && !(input instanceof Array);
}

function validatedIdentity(schema, name) {
  const validate = validator(schema);
  return input => {
    if (validate(input)) {
      return input;
    }
    const { field, message } = validate.errors[0];
    return new Error(`${field.replace(/^data/, name)} ${message}`);
  };
}

function creator(input, name) {
  if (typeof input === 'boolean') {
    return input ? identity : undefined;
  }
  if (typeof input === 'function') {
    return input;
  }
  if (typeof input === 'object' && input instanceof Array) {
    return (data) => input.reduce((res, prop) => {
      res[prop] = data[prop];
      return res;
    }, {});
  }
  if (isValidator(input)) {
    return validatedIdentity(input, name);
  }
}

export default function createAction(type, payloadCreator, metaCreator) {
  const finalPayloadCreator = creator(payloadCreator, 'payload');
  const finalMetaCreator = creator(metaCreator, 'meta');

  function actionCreator(payload, meta) {
    const action = { type };
    if (typeof finalPayloadCreator === 'function') {
      action.payload = finalPayloadCreator(payload);
      if (action.payload instanceof Error) {
        action.error = true;
      }
    }
    if (typeof finalMetaCreator === 'function') {
      action.meta = finalMetaCreator(meta);
    }
    return action;
  }

  actionCreator.toString = () => type;

  return actionCreator;
}
