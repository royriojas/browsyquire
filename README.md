# browsyquire [![build status](https://secure.travis-ci.org/royriojas/browsyquire.svg?branch=master)](http://travis-ci.org/royriojas/browsyquire)

**IMPORTANT** This is a fork of the awesome [proxyquireify](http://travis-ci.org/thlorenz/proxyquireify). All credit is for the original authors.

This fork adds the following features:
- [Wraps the "require magic" in a function](https://github.com/thlorenz/proxyquireify/pull/39)
  to prevent it from being executed but still allow browserify to include the proxied module
  in the bundle.
- Allows to mock dependencies that are outside of the main require flow
  (like [inside a method that is executed after the mock was created](https://github.com/thlorenz/proxyquireify/issues/40)).
- Enable [noCallThru globally](https://github.com/thlorenz/proxyquireify/issues/37).
  It adds a `noCallThru` function that can be called to indicate you want all your stubs to behave like if they have the property `'@noCallThru': true` on them. You can still override this behavior on each stub if desired by adding the property `@noCallThru` and set it to false.
- injects a function called `mockquire` to the modules that reference it. This function is
  just an alias to browsyquire, but is convenient to use because you don't need to pass the local
  require that is done automatically.

  ```javascript
  var mockquire = require('browsyquire')(require);
  ```

## installing

```bash
npm i browsyquire
```

## using it in browserify

```javascript
var fs         = require('fs')
  , proxyquire = require('browsyquire')
  , browserify = require('browserify')
  ;

browserify({ debug: true })
  .plugin(proxyquire.plugin) // !!do not forget to pass the plugin...
  .require(require.resolve('./test'), { entry: true })
  .bundle()
  .pipe(fs.createWriteStream(__dirname + '/bundle.js'));
```

And inside your tests:

```javascript
'use strict';

var stubs = {
  './bar': {
      wunder: function () { return 'wirklich wunderbar'; }
    , kinder: function () { return 'schokolade'; }
  }
};

var foo = mockquire('./src/foo', stubs); // mockquire will be defined... I promise :)
console.log(foo());
```

## using it as a drop in replacement

```javascript
// it is a drop in replacement for proxyquireify, so just do:
// It works exactly like the original but with the added behavior
// described above.
var proxyquire = require('browsyquire')(require);
```

## Using the `mockquire` method

```javascript
//===> mouth.js
module.exports = {
  saySomething: function () {
    return 'blah';
  }
};

//===> speaker.js
module.exports = {
  speak: function () {
    return require('./mouth').saySomething();
  }
};

describe('a test', function () {
  describe('it should not say blah, but foo', function () {
    var speaker = mockquire('./speaker', {
      './mouth': {
        saySomething: function () {
          return 'foo'
        }
      });
    var result = speaker.speak();
    expect(result).to.equal('foo'); // not blah! cause overriden by stub
  });
});
```

The `mockquire` function has 2 methods

### reset
Clears the stub cache. This is done automatically after each mockquire call, but can also be called manually if for any reason there is a need to clear it.

```javascript
// using mockquire
mockquire.reset(); // clear the stubs cache

// using the old api
var browsyquire = require('browsyquire')(require);
browsyquire.reset();
```

### noCallThru
Configure `browsyquire` to assume all stubs have the `@noCallThru` property set to true.

```javascript
// using mockquire
mockquire.noCallThru();

// using the old api
var browsyquire = require('browsyquire')(require);
browsyquire.noCallThru();
```



**Original Readme below.**


# proxyquireify

browserify `>= v2` version of [proxyquire](https://github.com/thlorenz/proxyquire).

Proxies browserify's require in order to make overriding dependencies during testing easy while staying **totally unobstrusive**. To run your tests in both Node and the browser, use [proxyquire-universal](https://github.com/bendrucker/proxyquire-universal).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Features](#features)
- [Installation](#installation)
- [Example](#example)
- [With Other Transforms](#with-other-transforms)
- [API](#api)
  - [proxyquire.plugin()](#proxyquireplugin)
  - [proxyquire.browserify()](#proxyquirebrowserify)
    - [Deprecation Warning](#deprecation-warning)
  - [proxyquire(request: String, stubs: Object)](#proxyquirerequest-string-stubs-object)
    - [Important Magic](#important-magic)
  - [noCallThru](#nocallthru)
- [More Examples](#more-examples)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Features

- **no changes to your code** are necessary
- non overriden methods of a module behave like the original
- mocking framework agnostic, if it can stub a function then it works with **proxyquireify**
- "use strict" compliant
- [automatic injection](https://github.com/thlorenz/proxyquireify#important-magic) of `require` calls to ensure the
  module you are testing gets bundled

## Installation

    npm install proxyquireify

To use with browserify `< 5.1` please `npm install proxyquireify@0.5` instead. To run your tests in PhantomJS, you may need to [use a shim](https://github.com/bendrucker/phantom-ownpropertynames).

## Example

**foo.js**:

```js
var bar = require('./bar');

module.exports = function () {
  return bar.kinder() + ' ist ' + bar.wunder();
};
```

**foo.test.js**:

```js
var proxyquire = require('proxyquireify')(require);

var stubs = {
  './bar': {
      wunder: function () { return 'wirklich wunderbar'; }
    , kinder: function () { return 'schokolade'; }
  }
};

var foo = proxyquire('./src/foo', stubs);

console.log(foo());
```

**browserify.build.js**:

```js
var browserify = require('browserify');
var proxyquire = require('proxyquireify');

browserify()
  .plugin(proxyquire.plugin)
  .require(require.resolve('./foo.test'), { entry: true })
  .bundle()
  .pipe(fs.createWriteStream(__dirname + '/bundle.js'));
```

load it in the browser and see:

    schokolade ist wirklich wunderbar

## With Other Transforms

If you're transforming your source code to JavaScript, you must apply those transforms before applying the proxyquireify plugin:

```js
browserify()
  .transform('coffeeify')
  .plugin(proxyquire.plugin)
  .require(require.resolve('./test.coffee'), { entry: true })
  .bundle()
  .pipe(fs.createWriteStream(__dirname + '/bundle.js'));
```

proxyquireify needs to parse your code looking for `require` statements. If you `require` anything that's not valid JavaScript that [acorn](https://github.com/marijnh/acorn) can parse (e.g. CoffeeScript, TypeScript), you need to make sure the relevant transform runs before proxyquireify.

## API

### proxyquire.plugin()

**proxyquireify** functions as a browserify plugin and needs to be registered with browserify like so:

```js
var browserify = require('browserify');
var proxyquire = require('proxyquireify');

browserify()
  .plugin(proxyquire.plugin)
  .require(require.resolve('./test'), { entry: true })
  .bundle()
  .pipe(fs.createWriteStream(__dirname + '/bundle.js'));
```

Alternatively you can register **proxyquireify** as a plugin from the command line like so:

```sh
browserify -p proxyquireify/plugin test.js > bundle.js
```

### proxyquire.browserify()

#### Deprecation Warning

This API to setup **proxyquireify** was used prior to [browserify plugin](https://github.com/substack/node-browserify#bpluginplugin-opts) support.

It has not been removed yet to make upgrading **proxyquireify** easier for now, but it **will be deprecated in future
versions**. Please consider using the plugin API (above) instead.

****

To be used in build script instead of `browserify()`, autmatically adapts browserify to work for tests and injects
require overrides into all modules via a browserify transform.

```js
proxyquire.browserify()
  .require(require.resolve('./test'), { entry: true })
  .bundle()
  .pipe(fs.createWriteStream(__dirname + '/bundle.js'));
```

****

### proxyquire(request: String, stubs: Object)

- **request**: path to the module to be tested e.g., `../lib/foo`
- **stubs**: key/value pairs of the form `{ modulePath: stub, ... }`
  - module paths are relative to the tested module **not** the test file
  - therefore specify it exactly as in the require statement inside the tested file
  - values themselves are key/value pairs of functions/properties and the appropriate override

```js
var proxyquire =  require('proxyquireify')(require);
var barStub    =  { wunder: function () { 'really wonderful'; } };

var foo = proxyquire('./foo', { './bar': barStub })
```

#### Important Magic

In order for browserify to include the module you are testing in the bundle, **proxyquireify** will inject a
`require()` call for every module you are proxyquireing. So in the above example `require('./foo')` will be injected at
the top of your test file.

### noCallThru

By default **proxyquireify** calls the function defined on the *original* dependency whenever it is not found on the stub.

If you prefer a more strict behavior you can prevent *callThru* on a per module or per stub basis.

If *callThru* is disabled, you can stub out modules that weren't even included in the bundle. **Note**, that unlike in
proxquire, there is no option to prevent call thru globally.

```js
// Prevent callThru for path module only
var foo = proxyquire('./foo', {
    path: {
      extname: function (file) { ... }
    , '@noCallThru': true
    }
  , fs: { readdir: function (..) { .. } }
});

// Prevent call thru for all contained stubs (path and fs)
var foo = proxyquire('./foo', {
    path: {
      extname: function (file) { ... }
    }
  , fs: { readdir: function (..) { .. } }
  , '@noCallThru': true
});

// Prevent call thru for all stubs except path
var foo = proxyquire('./foo', {
    path: {
      extname: function (file) { ... }
    , '@noCallThru': false
    }
  , fs: { readdir: function (..) { .. } }
  , '@noCallThru': true
});
```

## More Examples

- [foobar](https://github.com/thlorenz/proxyquireify/tree/master/examples/foobar)
