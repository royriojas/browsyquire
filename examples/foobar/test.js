'use strict';

var proxyquire = require('browsyquire')(require);

var stubs = {
  './bar': {
      wunder: function () { return 'wirklich wunderbar'; }
    , kinder: function () { return 'schokolade'; }
  }
};

var foo = proxyquire('./src/foo', stubs);
console.log(foo());
