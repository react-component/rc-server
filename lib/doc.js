var fs = require('fs');
var path = require('path');
var marked = require('marked');
var highlightJs = require('highlight.js');
var renderer = new marked.Renderer();
var mUtils = require('modulex-util');
var util = require('./util');
var prefix = '_$_';
var ReactTools = require('react-tools');
var cwd = process.cwd();
var cwdLength = cwd.length;
var uuid = require('node-uuid');
var currentFile;

function startsWithPackageName(str) {
  return !mUtils.startsWith(str, '.') && !mUtils.startsWith(str, '/') && !mUtils.startsWith(str, 'http:') && !mUtils.startsWith(str, 'https:');
}

function findPackagePath(dir, name, suffix) {
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

renderer.code = function (code, language) {
  var isRun;
  language = language || '';
  if (isRun = mUtils.startsWith(language, prefix)) {
    language = language.slice(prefix.length);
  }
  var ret = '';
  var originalCode = code;
  if (isRun) {
    if (language === 'js') {
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
      code = 'define(location.pathname + "' + id + '", function(require) {' + code + '});require(location.pathname + "' + id + '");';
      ret += '<script>' + code + '</script>';
    } else if (language === 'html') {
      ret += code;
    }
  }
  ret += '<div class="highlight"><pre><code class="' + language + '">' + highlightJs.highlightAuto(originalCode).value + '</code></pre></div>';
  return ret;
};

var requireRegExp = /[^.'"]\s*require\s*\((['"])([^)]+)\1\)/g;

marked.setOptions({
  renderer: renderer
});

module.exports = function () {
  return function *(next) {
    var pathname = this.path;
    if (pathname.match(/\.md$/)) {
      var content = fs.readFileSync(path.join(process.cwd(), pathname), {
        encoding: 'utf-8'
      });
      content = content.replace(/````(\w)/g, function (m, w) {
        return '```_$_' + w;
      }).replace(/````/g, '```');
      currentFile = pathname;
      yield this.render('doc', mUtils.merge({
        title: path.basename(pathname, '.md'),
        content: marked(content)
      }, util.getPackages()));
    } else {
      yield *next;
    }
  };
};
