'use strict';

module.exports = function (app, option) {
  option = option || {};
  var serve = require('koa-static');
  var babel = require('babel-core');
  var cwd = process.cwd();
  var util = require('modulex-util');
  var path = require('path');
  require('xtpl').config({
    XTemplate: require('xtemplate')
  });
  app = app || require('koa')();
  app = require('xtpl/lib/koa')(app, {
    views: path.join(__dirname, './views')
  });
  var fs = require('fs');
  var root = cwd;
  var serveIndex = require('koa-serve-index');
  var modularize = require('koa-modularize');
  var jsx = require('koa-jsx');
  var koaBody = require('koa-body');
  var jscoverHandler = require('koa-node-jscover');
  var jscoverCoveralls = require('node-jscover-coveralls/lib/koa');
  var router = require('koa-router');
  var reactPath = 'node_modules/react';
  var currentPackageInfo = require(path.join(cwd, 'package.json'));
  var autoprefixer = require('autoprefixer-core');

  app.use(require('koa-favicon')(path.join(__dirname, './public/favicon.ico')));
  app.use(require('./lib/js2html')());
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
    babel: babel,
    // for test coverage
    transformOption: {
      retainLines: true
    },
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

  var less = require('koa-less');
  app.use(less(cwd, {
    postprocess: {
      css: function (css) {
        return autoprefixer.process(css).css;
      }
    },
    compiler: {
      compress: false
    }
  }));

  // before less
  app.use(modularize(root, util.mix({
    nowrap: function () {
      return this.url.indexOf('nowrap') !== -1 || this.url.indexOf('/node_modules/node-jscover/') !== -1;
    },
    modules: {
      react: path.join(cwd, reactPath, 'react.js'),
      'react/addons': path.join(cwd, reactPath, 'addons.js')
    },
    next: function () {
      return 1;
    }
  }, option.modularize)));

  app.use(jscoverCoveralls({}));

  app.use(require('koa-source-map')({
    skip: function (currentApp, next) {
      if (currentApp.url.indexOf('-coverage.js') !== -1) {
        return true;
      }
    }
  }));

  app.use(serveIndex(root, {
    hidden: true,
    view: 'details'
  }));

  app.use(serve(root, {
    hidden: true
  }));

  var utils = require('./lib/util');
  var appname = currentPackageInfo.name;

  app.get('/tests/runner.html', function* () {
    var react = 1;
    if (!fs.existsSync(path.join(cwd, reactPath))) {
      react = 0;
    }
    yield this.render('runner', util.merge({
      appname: appname,
      react: react,
      query: this.query
    }, utils.getPackages()));
  });

  return app;
};
