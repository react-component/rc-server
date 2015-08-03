'use strict';

var lessMiddleware = require('../vendor/less-middleware/middleware');

function less(req, res, options) {
  return function (callback) {
    lessMiddleware.apply(this, options)(req, res, callback);
  };
}

module.exports = function () {
  var options = arguments;
  return function*(next) {
    yield less(this.req, this.res, options);
    yield next;
  };
};
