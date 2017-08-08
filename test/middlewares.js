import expect from 'expect.js';

import { chain } from '../middlewares';

describe('Middlewares', () => {
  describe('#chain', done => {
    it('should pass data via third argument to next middleware', done => {
      chain()((msg, data, next) => {
        data.middleware1 = 'middleware1';
        next();
      }, (msg, data, next) => {
        data.middleware2 = 'middleware2';
        next();
      }, (msg, data, next) => {
        data.middleware3 = 'middleware3';
        next();
      }, (msg, data, next) => {
        expect(data).to.have.property('middleware1', 'middleware1');
        expect(data).to.have.property('middleware2', 'middleware2');
        expect(data).to.have.property('middleware3', 'middleware3');
        done();
      });
    });
  });
});
