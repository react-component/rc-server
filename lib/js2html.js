'use strict';

var fs = require('fs');
var path = require('path');
var highlightJs = require('highlight.js');
var mUtils = require('modulex-util');
var util = require('./util');
var cwd = process.cwd();
var pkg = require(path.join(cwd, 'package.json'));

var srcPath = new RegExp('(["\']' + pkg.name + ')\/src\/', 'g');

function replaceSrcToLib(modName) {
  return modName.replace(srcPath, function (m, m1) {
    return m1 + '/lib/';
  });
}

function transformJsForRender(code, jsName) {
  var ret = '';
  ret += '<script>\n' + 'require("./' + jsName + '");' + '\n</script>';
  ret += '<div class="highlight"><pre><code>' + highlightJs.highlightAuto(replaceSrcToLib(code)).value + '</code></pre></div>';
  return ret;
}

module.exports = function () {
  return function* (next) {
    var pathname = this.path;
    if (pathname.match(/\.html$/)) {
      var filePath = path.join(process.cwd(), pathname);
      if (fs.existsSync(filePath)) {
        var content = fs.readFileSync(filePath, {
          encoding: 'utf-8'
        }).trim();
        if (content && content !== 'placeholder') {
          yield *next;
          return;
        }
      }
      var jsName;
      var jsPath = pathname.replace(/\.html$/, '.js');
      jsName = path.basename(jsPath, '.js');
      var jsFile = path.join(process.cwd(), jsPath);
      if (!fs.existsSync(jsFile)) {
        jsFile = path.join(process.cwd(), pathname.replace(/\.html$/, '.jsx'));
        jsName = path.basename(jsPath, '.jsx');
      }
      var code = fs.readFileSync(jsFile, {
        encoding: 'utf-8'
      });
      yield this.render('js2html', mUtils.merge({
        title: path.basename(pathname, '.html'),
        pkg: pkg,
        query: mUtils.mix(this.query),
        content: transformJsForRender(code, jsName)
      }, util.getPackages()));
    } else {
      yield *next;
    }
  };
};
