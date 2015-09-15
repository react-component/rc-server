#!/usr/bin/env node

var app = require('../lib/')();
var port = process.env.npm_package_config_port;
app.listen(port);
console.log('listen at ' + port);
