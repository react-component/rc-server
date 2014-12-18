# rc-server

development server for react component

[![NPM version][npm-image]][npm-url]
[![gemnasium deps][gemnasium-image]][gemnasium-url]
[![node version][node-image]][node-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/rc-server.svg?style=flat-square
[npm-url]: http://npmjs.org/package/rc-server
[travis-image]: https://img.shields.io/travis/react-component/server.svg?style=flat-square
[travis-url]: https://travis-ci.org/react-component/server
[coveralls-image]: https://img.shields.io/coveralls/react-component/server.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/react-component/server?branch=master
[gemnasium-image]: http://img.shields.io/gemnasium/react-component/server.svg?style=flat-square
[gemnasium-url]: https://gemnasium.com/react-component/server
[node-image]: https://img.shields.io/badge/node.js-%3E=_0.11-green.svg?style=flat-square
[node-url]: http://nodejs.org/download/
[download-image]: https://img.shields.io/npm/dm/rc-server.svg?style=flat-square
[download-url]: https://npmjs.org/package/rc-server

## Feature

* support jsx
* support mocha-phantomjs
* support travis
* support coveralls.io
* support md render as html


## Usage

### file structure

```
- .travis.yml
- lib
- index.js
- tests
  - index-spec.js
- package.json
```

### .travis.yml

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
var TestUtils = require('rc-server');

describe('it', function(){
    it('works', function(){
        var component = (<Component/><a></a></Component>);
        expect(TestUtils.children(component).length).to.be(1);
    });
});
```


### start server

```
npm install
npm start
```

open [http://localhost:8001/tests/runner.html](http://localhost:8001/tests/runner.html) to see test