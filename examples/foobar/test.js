'use strict';

var stubs = {
  './bar': {
      wunder: function () { return 'wirklich wunderbar'; }
    , kinder: function () { return 'schokolade'; }
  }
};

var foo = mockquire('./src/foo', stubs);
console.log(foo());
