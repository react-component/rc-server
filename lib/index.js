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
    views: path.join(__dirname, '../views')
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
  var lessReg = /\.less['"]/;
  var matchRequire = require('match-require');

  app.use(require('koa-favicon')(path.join(__dirname, '../public/favicon.ico')));

  app.use(router(app));

  var utils = require('./util');
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

  app.use(require('./js2html')());

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
      var ctx = this;
      if (lessReg.test(ctx.body)) {
        ctx.body = matchRequire.replaceAll(ctx.body, function (match, quote, dep) {
          if (lessReg.test(dep + quote)) {
            return 'require(' + quote + dep.replace(/\.less$/g, '.css') + quote + ')';
          }
          return match;
        });
      }
      return 1;
    }
  }));
  app.use(jscoverHandler({
    jscover: require('node-jscover'),
    next: function () {
      return 1;
    }
  }));

  app.use(require('./koa-less')(cwd, {
    postprocess: {
      css: function (css) {
        return autoprefixer.process(css).css;
      }
    },
    storeCss: function (cssPath, css, req, res) {
      res.setHeader('Content-Length', new Buffer(css).length);
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.statusCode = (200);
      res.end(css);
    },
    render: {
      compress: false
    }
  }));

  // before less
  app.use(modularize(root, util.mix({
    nowrap: function () {
      return this.url.indexOf('nowrap') !== -1 ||
        this.url.indexOf('/node_modules/node-jscover/') !== -1 ||
        this.url.indexOf('/mocha/mocha.js') !== -1;
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

  return app;
};
