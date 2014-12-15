var cwd = process.cwd();
var path = require('path');
var fs = require('fs');
var node_modules = 'node_modules';
var utils = require('modulex-util');

module.exports = {
  findPackage: function (name) {
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
};
