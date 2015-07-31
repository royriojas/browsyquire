'use strict';
/*jshint asi: true, browser: true */

var proxyquire =  require('browsyquire')(require)
  ;

test('\nreplacing a module with null to simulate a non found module', function (t) {

  var myPolyfill;
  var foober = proxyquire('../fixtures/replace-with-null', { './bar': null, './es-bar': {
    Polyfill: myPolyfill
  } });

  t.equal(myPolyfill, foober, 'returns the modified value')

  t.end()
})
