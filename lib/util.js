'use strict';

var cwd = process.cwd();
var path = require('path');
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

function deCamelCase(m) {
  return '-' + m.toLowerCase();
}

for (var p in packages) {
  var name = p;
  if (typeof packages[p] === 'string') {
    name = packages[p];
  } else {
    name = name.replace(/[A-Z]/g, deCamelCase);
  }
  name += '/package.json';
  packages[p] = findPackage(name);
}
packages.highlightJs = packages['highlight.js'];

function findPackage(packageName) {
  var file = require.resolve(packageName);
  var dir = path.dirname(file);
  var url = path.relative(cwd, dir);
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
