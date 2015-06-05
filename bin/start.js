'use strict';

var app = require('../')();
var port = process.env.npm_package_config_port;
app.listen(port);
console.log('listen at ' + port);
