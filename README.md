# rc-server

development server for react component

## Feature

* support jsx
* support mocha-phantomjs
* support travis
* support coveralls.io


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
var TestUtils = require('rc-test-utils');

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