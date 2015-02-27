module.exports = function () {
  var serve = require('koa-static');
  var cwd = process.cwd();
  var path = require('path');
  require('xtpl').config({
    XTemplate: require('xtemplate')
  });
  var app = require('xtpl/lib/koa')(require('koa')(), {
    views: path.join(__dirname, './views')
  });
  var fs = require('fs');
  var root = cwd;
  var serveIndex = require('koa-serve-index');
  var modularize = require('koa-modularize');
  var mount = require('koa-mount');
  var jsx = require('koa-jsx');
  var koaBody = require('koa-body');
  var jscoverHandler = require('koa-node-jscover');
  var jscoverCoveralls = require('node-jscover-coveralls/lib/koa');
  var router = require('koa-router');
  var reactPath = 'node_modules/react';

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
  var less = require('koa-less');
  app.use(less(cwd));

  // before less
  app.use(modularize(root, {
    nowrap: function () {
      return this.url.indexOf('nowrap') != -1 || this.url.indexOf('/node_modules/node-jscover/') != -1;
    },
    packageHook: function (file, packageName, suffix) {
      // only can has one global react
      if (packageName === 'react') {
        if (!fs.existsSync(path.join(cwd, reactPath + '/package.json'))) {
          return packageName + (suffix || '');
        }
        if (!suffix) {
          var packageInfo = require(path.join(cwd, reactPath + '/package.json'));
          var main;
          if (typeof packageInfo.browser === 'string') {
            main = packageInfo.browser
          }
          main = main || packageInfo.main || 'index';
          if (main.slice(0, 2) === './') {
            main = main.slice(2);
          }
          suffix = '/' + main;
        }
        return '/' + reactPath + suffix;
      }
    },
    next: function () {
      var fileType = (this.path.match(/\.(js|css)$/) || [])[1];
      return fileType === 'css';
    }
  }));

  // autoprefixer
  var autoprefixer = require('autoprefixer-core');
  app.use(function *(next) {
    var fileType = (this.path.match(/\.(js|css)$/) || [])[1];
    if (fileType == 'css' && this.body) {
      try {
        this.body = autoprefixer.process(this.body).css;
      } catch (e) {
        console.error(e);
      }
      this.set('Content-Length', Buffer.byteLength(this.body));
    } else {
      yield *next;
    }
  });

  app.use(jscoverCoveralls());
  app.use(serveIndex(root, {
    hidden: true,
    view: 'details'
  }));
  app.use(serve(root, {
    hidden: true
  }));

  var utils = require('./lib/util');
  var mUtils = require('modulex-util');
  var appname = require(path.join(cwd, 'package.json')).name;
  app.get('/tests/runner.html', function *() {
    var react = 1;
    if (!fs.existsSync(path.join(cwd, reactPath))) {
      react = 0;
    }
    yield this.render('runner', mUtils.merge({
      appname: appname,
      react: react,
      query: this.query
    }, utils.getPackages()));
  });

  return app;
};
