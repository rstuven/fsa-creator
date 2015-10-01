fsa-creator
===========

[![build status](https://img.shields.io/travis/rstuven/fsa-creator/master.svg?style=flat-square)](https://travis-ci.org/rstuven/fsa-creator)
[![npm version](https://img.shields.io/npm/v/fsa-creator.svg?style=flat-square)](https://www.npmjs.com/package/fsa-creator)

[Flux Standard Action](https://github.com/acdlite/flux-standard-action) creation with schema validation.

```js
npm install --save fsa-creator
```

This module started as a fork of [redux-actions](https://github.com/acdlite/redux-actions) by Andrew Clark.
It focuses in the creation of actions with handy specifications of mapping functions and schema validation.

### `createAction(type, ?payloadSpec, ?metaSpec)`

`payloadSpec` and `metaSpec` are *mapping function specifications* for `payload`and `meta` properties, respectively.

Returns an action creator function with following signature:

##### `function actionCreator(?payloadInput, ?metaInput)`

`payloadInput` and `metaInput` are the input of the respective mapping function.

A mapping function specification can be:

#### – `undefined` or `false` (omission)

The property (`payload` or `meta`) will be omitted.

#### – Function (mapping)

A mapping function will be used.

Example:

```js
let actionCreator = createAction('ACTION', arg => '(u' + arg + 'u)');

expect(actionCreator('.')).to.deep.equal({
  type: 'ACTION',
  payload: '(u.u)'
});
```

#### – `true` (identity mapping without validation)

The identity function will be used.

Example:

```js
let increment = createAction('INCREMENT', true);
// same as
increment = createAction('INCREMENT', amount => amount);

expect(increment(42)).to.deep.equal({
  type: 'INCREMENT',
  payload: 42
});
```

#### – Plain object (identity mapping with validation)

A validated identity function will be used. [JSONSchema v4](http://json-schema.org/) validation powered by [is-my-json-valid](https://github.com/mafintosh/is-my-json-valid).

Example:

```js

let actionCreator = createAction('ACTION', {
  required: true,
  type: 'object',
  properties: {
    hello: {
      required: true,
      type: 'string',
      description: 'A greeting'
    }
  }
});

expect(actionCreator()).to.deep.equal({
  type: 'ACTION',
  error: true,
  payload: new Error('payload is required')
});

expect(actionCreator({})).to.deep.equal({
  type: 'ACTION',
  error: true,
  payload: new Error('payload.hello is required')
});

expect(actionCreator({hello: 123})).to.deep.equal({
  type: 'ACTION',
  error: true,
  payload: new Error('payload.hello is the wrong type')
});

expect(actionCreator({hello: 'world'})).to.deep.equal({
  type: 'ACTION',
  payload: {hello: 'world'}
});
```

#### – Array (property extraction)

A property extraction function will be used. This is thought to be used as a fast way of document expected properties, without defining a schema (yet).

Example:

```js
let actionCreator = createAction('ACTION', ['prop1', 'prop3']);

expect(actionCreator({prop1: 1, prop2: 2, prop3: 3})).to.deep.equal({
  type: 'ACTION',
  payload: {
    prop1: 1,
    prop3: 3
  }
});
```

---
**NOTE:** The more correct name for `createAction` function probably is `createActionCreator()`, but that seems a bit redundant.
