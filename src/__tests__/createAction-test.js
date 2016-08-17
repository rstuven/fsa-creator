import isPlainObject from 'lodash.isplainobject';
import { createAction } from '../';

describe('createAction()', () => {
  describe('resulting action creator', () => {
    const type = 'TYPE';

    it('returns plain object', () => {
      const actionCreator = createAction(type, true);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(isPlainObject(action)).to.be.true;
    });

    it('uses return value as payload', () => {
      const actionCreator = createAction(type, true);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action.payload).to.equal(foobar);
    });

    it('discard payload', () => {
      const actionCreator = createAction(type);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action.payload).to.not.exist;
    });

    it('has no extraneous keys', () => {
      const actionCreator = createAction(type, true);
      const foobar = { foo: 'bar', ping: 'pong' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar,
      });
    });

    it('select keys', () => {
      const actionCreator = createAction(type, ['ping']);
      const foobar = { foo: 'bar', ping: 'pong' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: { ping: 'pong' },
      });
    });

    it('uses identity function if actionCreator is not a function', () => {
      const actionCreator = createAction(type, true);
      const foobar = { foo: 'bar' };
      const action = actionCreator(foobar);
      expect(action).to.deep.equal({
        type,
        payload: foobar,
      });
    });

    it('accepts a second parameter for adding meta to object', () => {
      const actionCreator = createAction(type, ['cid'], ['cid']);
      const foobar = { foo: 'bar', cid: 1 };
      const meta = { cid: 2, ping: 'pong' };
      const action = actionCreator(foobar, meta);
      expect(action).to.deep.equal({
        type,
        payload: {
          cid: 1,
        },
        meta: {
          cid: 2,
        },
      });
    });

    it('validates payload schema', () => {
      const actionCreator = createAction(type, {
        required: true,
        type: 'object',
        properties: {
          hello: {
            required: true,
            type: 'string',
            description: 'A greeting',
          },
        },
      });
      const action1 = actionCreator();
      expect(action1).to.deep.equal({
        type,
        error: true,
        payload: new Error('payload is required'),
      });

      const action2 = actionCreator({});
      expect(action2).to.deep.equal({
        type,
        error: true,
        payload: new Error('payload.hello is required'),
      });

      const action3 = actionCreator({ hello: 123 });
      expect(action3).to.deep.equal({
        type,
        error: true,
        payload: new Error('payload.hello is the wrong type'),
      });

      const action4 = actionCreator({ hello: 'world' });
      expect(action4).to.deep.equal({
        type,
        payload: { hello: 'world' },
      });
    });

    it('validates meta schema', () => {
      const actionCreator = createAction(type, true, {
        required: true,
      });

      const action1 = actionCreator();
      expect(action1.error).to.not.exist;
      expect(action1.meta.toString()).to.equal('Error: meta is required');

      const action2 = actionCreator(undefined, 123);
      expect(action2.error).to.not.exist;
      expect(action2.meta).to.equal(123);
    });

    it('casts as string', () => {
      const actionCreator = createAction(type);
      const obj = {
        [actionCreator]: null,
      };
      expect(obj).to.deep.equal({ [type]: null });
    });
  });
});
