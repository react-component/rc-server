var cwd = process.cwd();
var path = require('path');
var fs = require('fs');
var node_modules = 'node_modules';
var utils = require('modulex-util');
var packages = {
  'es5Shim': 1,
  'normalize': 'normalize.css',
  'consolePolyfill': 1,
  'modulex': 1,
  'nodeJscover': 1,
  'mocha': 1,
  'highlight.js': 1
};
for (var p in packages) {
  var name = p;
  if (typeof packages[p] === 'string') {
    name = packages[p];
  } else {
    name = name.replace(/[A-Z]/g, function (m) {
      return '-' + m.toLowerCase();
    });
  }
  packages[p] = findPackage(name);
}
packages.highlightJs = packages['highlight.js'];

function findPackage(name) {
  var file = require.resolve(name);
  var dir = path.dirname(file);
  var lastDir = dir;
  while (!utils.endsWith(dir, node_modules)) {
    lastDir = dir;
    dir = path.resolve(dir, '../');
  }
  var url = path.relative(cwd, lastDir);
  if (!utils.startsWith(url, node_modules)) {
    url = path.join(node_modules, url);
  }
  return url;
}

module.exports = {
  findPackage: findPackage,

  getPackages: function () {
    return packages;
  }
};
