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
  if (isRun) {
    if (language === 'js') {
      code = code.replace(requireReg, function (m, leading, mods) {
        mods = mods.trim();
        mods = mods.split(/,/);
        var deps = [];
        mods.forEach(function (dep, index) {
          dep = dep.trim();
          if (!dep) {
            return;
          }
          dep = dep.slice(1, -1);
          if (startsWithPackageName(dep)) {
            var packageName = getPackageName(dep);
            var suffix = '';
            if (packageName !== dep) {
              suffix = packageName.suffix;
              packageName = packageName.packageName;
            }
            dep = '"' + findPackagePath(cwd, packageName, suffix) + '"';
          } else {
            dep = '"' + dep + '"';
          }
          deps.push(dep);
        });
        return leading + '([' + deps.join(',') + ']';
      });
      code = ReactTools.transform(code);
      ret += '<script>' + code + '</script>';
    } else if (language === 'html') {
      ret += code;
    }
  }
  ret += '<div class="highlight"><pre><code class="' + language + '">' + highlightJs.highlightAuto(code).value + '</code></pre></div>';
  return ret;
};

var requireReg = /(seajs\.use|require)\s*\(\s*\[([^\]]+)\s*\]/;

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
      yield this.render('doc', mUtils.merge({
        title: path.basename(pathname, '.md'),
        content: marked(content)
      }, util.getPackages()));
    } else {
      yield *next;
    }
  };
};
