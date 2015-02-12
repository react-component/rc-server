var fs = require('fs');
var path = require('path');
var highlightJs = require('highlight.js');
var mUtils = require('modulex-util');
var util = require('./util');
var ReactTools = require('react-tools');
var cwd = process.cwd();
var cwdLength = cwd.length;
var uuid = require('node-uuid');
var currentPackageInfo = require(path.join(cwd, 'package.json'));

function startsWithPackageName(str) {
  return !mUtils.startsWith(str, '.') && !mUtils.startsWith(str, '/') && !mUtils.startsWith(str, 'http:') && !mUtils.startsWith(str, 'https:');
}

function findPackagePath(dir, name, suffix) {
  if (name === currentPackageInfo.name) {
    suffix = suffix || '';
    var start = '/';
    if (mUtils.startsWith(suffix, '/')) {
      start = '';
    }
    return start + (suffix ? suffix : 'index.js');
  }
  var packageDir = path.join(dir, 'node_modules/' + name);
  if (fs.existsSync(packageDir)) {
    var packagePath = packageDir.slice(cwdLength);
    if (!suffix) {
      var main = require(path.join(packageDir, 'package.json')).main || 'index';
      if (mUtils.startsWith(main, './')) {
        main = main.slice(2);
      }
      suffix = '/' + main;
    }
    return packagePath + suffix;
  }
  console.warn('[koa-modularize]: Can not find package in dir ' + dir + ': ' + name + ', please npm install ' + name + '!');
  return name;
}

function getPackageName(moduleName) {
  var index = moduleName.indexOf('/');
  if (index !== -1) {
    return {
      packageName: moduleName.slice(0, index),
      suffix: moduleName.slice(index)
    };
  } else {
    return moduleName;
  }
}

function transformJsForRender(code, language) {
  var ret = '';
  var originalCode = code;
  // modify package path
  code = code.replace(requireRegExp, function (match, quote, dep) {
    var leading = match.match(/^[^.'"]\s*require\s*\(/)[0];
    if (startsWithPackageName(dep)) {
      var packageName = getPackageName(dep);
      var suffix = '';
      if (packageName !== dep) {
        suffix = packageName.suffix;
        packageName = packageName.packageName;
      }
      return leading + quote + findPackagePath(cwd, packageName, suffix) + quote + ')';
    } else {
      return match;
    }
  });
  code = ReactTools.transform(code);
  var id = uuid.v4();
  code = 'define(location.pathname + "' + id + '", function(require,exports,module) {' + code + '});require(location.pathname + "' + id + '");';
  ret += '<script>' + code + '</script>';
  ret += '<div class="highlight"><pre><code class="' + language + '">' + highlightJs.highlightAuto(originalCode).value + '</code></pre></div>';
  return ret;
}

var requireRegExp = /[^.'"]\s*require\s*\((['"])([^)]+)\1\)/g;

module.exports = function () {
  return function *(next) {
    var pathname = this.path;
    if (pathname.match(/\.html$/)) {
      var filePath = path.join(process.cwd(), pathname);
      if (fs.existsSync(filePath)) {
        var content = fs.readFileSync(filePath, {
          encoding: 'utf-8'
        }).trim();
        if (!content || content === 'placeholder') {

        } else {
          yield *next;
          return;
        }
      }
      var js = fs.readFileSync(path.join(process.cwd(), pathname.replace(/\.html$/, '.js')), {
        encoding: 'utf-8'
      });
      yield this.render('js2html', mUtils.merge({
        title: path.basename(pathname, '.md'),
        query: mUtils.mix(this.query),
        content: transformJsForRender(js)
      }, util.getPackages()));
    } else {
      yield *next;
    }
  };
};
