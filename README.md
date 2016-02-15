# rc-server

development server for react component

* This project is deprecated, use [rc-tools run server](https://github.com/react-component/rc-tools) *

[![NPM version][npm-image]][npm-url]
[![gemnasium deps][gemnasium-image]][gemnasium-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/rc-server.svg?style=flat-square
[npm-url]: http://npmjs.org/package/rc-server
[travis-image]: https://img.shields.io/travis/react-component/rc-server.svg?style=flat-square
[travis-url]: https://travis-ci.org/react-component/rc-server
[coveralls-image]: https://img.shields.io/coveralls/react-component/rc-server.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/react-component/rc-server?branch=master
[gemnasium-image]: http://img.shields.io/gemnasium/react-component/rc-server.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/react-component/rc-server
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.11-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/rc-server.svg?style=flat-square
[download-url]: https://npmjs.org/package/rc-server

## Feature

* support jsx
* support autoprefixer
* support mocha-phantomjs
* support travis
* support coveralls.io
* support react js module render as html
* support load commonjs file into browser and run


## Usage

### file structure

```
- .travis.yml
- examples
 - index.html
 - index.js
- lib
 - Component.js
- index.js
- tests
  - index-spec.js
- package.json
```

Suggest using https://github.com/react-component/generator-rc

#### index.js

```js
/** @jsx React.DOM */
var Component = require('./lib/Component');
module.exports = <Component />
```

#### Component.js

```js
/** @jsx React.DOM */
var React = require('react');
var Component = React.createClass({
    // TODO
    render: function(){
        return <div></div>;
    };
});
module.exports = Component;
```

#### .travis.yml

```
language: node_js
node_js:
- 0.11
before_script:
- npm start &
- npm install mocha-phantomjs -g
- phantomjs --version
script:
- npm test
- npm run browser-test
- npm run browser-test-cover
```

#### package.json

```js
{
    "devDependencies": {
        "rc-server": "^1.0.0"
    },
    "config": {
        "port": 8001
    },
    "scripts": {
        "start": "node --harmony node_modules/.bin/rc-server",
        "browser-test": "mocha-phantomjs http://localhost:$npm_package_config_port/tests/runner.html",
        "browser-test-cover": "mocha-phantomjs -R node_modules/rc-server/node_modules/node-jscover/lib/reporters/mocha/console http://localhost:$npm_package_config_port/tests/runner.html?coverage"

    }
}
```

#### index-spec.js

```js
var expect = require('expect.js');
var React = require('react');
var Component = require('../');

describe('it', function(){
    it('works', function(){
        var component = (<Component/><a></a></Component>);
        expect(component).to.be(component);
    });
});
```

#### index.html

```
placeholder
```

remove backslash!

Suggest using https://github.com/react-component/generator-rc

### start server

```
npm install
npm start
```

* open [http://localhost:8001/tests/runner.html](http://localhost:8001/tests/runner.html) to see test
* open [http://localhost:8001/examples/index.md](http://localhost:8001/examples/index.html) to see demo