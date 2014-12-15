#!/usr/bin/env node

var serve = require('koa-static');
var cwd = process.cwd();
var path = require('path');
var app = require('xtpl/lib/koa')(require('koa')(), {
  views: path.join(__dirname,'../views')
});
var fs = require('fs');
var root = path.resolve(cwd, './');
var serveIndex = require('koa-serve-index');
var modularize = require('koa-modularize');
var mount = require('koa-mount');
var jsx = require('koa-jsx');
var koaBody = require('koa-body');
var jscoverHandler = require('koa-node-jscover');
var jscoverCoveralls = require('node-jscover-coveralls/lib/koa');
var router = require('koa-router');

app.use(router(app));
// parse application/x-www-form-urlencoded
app.use(koaBody());
app.use(jscoverHandler({
  onlyLoad: function () {
    return 1;
  },
  next: function () {
    return 1;
  }
}));
app.use(jsx(root, {
  reactTools: require('react-tools'),
  next: function () {
    return 1;
  }
}));
app.use(jscoverHandler({
  jscover: require('node-jscover'),
  next: function () {
    return 1;
  }
}));
app.use(mount('/', modularize(root, {
  nowrap: function () {
    return this.url.indexOf('nowrap') != -1 || this.url.indexOf('/node_modules/node-jscover/') != -1;
  }
})));
app.use(jscoverCoveralls());
app.use(serveIndex(root, {
  hidden: true,
  view: 'details'
}));
app.use(serve(root, {
  hidden: true
}));


var utils = require('../lib/util');
var mUtils = require('modulex-util');
var packages = {
  'es5Shim': 1,
  'consolePolyfill': 1,
  'modulex': 1,
  'nodeJscover': 1,
  'nodeJscoverCoveralls': 1,
  'mocha': 1
};
for (var p in packages) {
  packages[p] = utils.findPackage(p.replace(/[A-Z]/g, function (m) {
    return '-' + m.toLowerCase();
  }));
}
var appname = require(path.join(cwd, 'package.json')).name;
app.get('/tests/runner.html', function *() {
  yield this.render('runner', mUtils.merge({
    appname: appname
  }, packages));
});

var port = process.env.npm_package_config_port;
app.listen(port);
console.log('listen at ' + port);
