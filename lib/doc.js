var fs = require('fs');
var path = require('path');
var marked = require('marked');
var highlightJs = require('highlight.js');
var renderer = new marked.Renderer();
var mUtils = require('modulex-util');
var util = require('./util');

renderer.code = function (code, language) {
  var ret = '<div class="highlight"><pre><code class="'+language+'">' + highlightJs.highlightAuto(code).value + '</code></pre></div>';
  if (language === 'js') {
    ret += '<script>' + code + '</script>';
  }
  return ret;
};

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
      yield this.render('doc', mUtils.merge({
        title: path.basename(pathname,'.md'),
        content: marked(content)
      }, util.getPackages()));
    } else {
      yield *next;
    }
  };
};
