'use strict';

var detective = require('detective');
var hasRequire = require('has-require');

function simpleRequire(n) {
  // var proxy = require('browsyquire')
  return n.parent
      && n.parent.id
      && n.parent.id.name;
}

function requireWithImmediateCall(n) {
  // var proxy = require('browsyquire')(require)
  var p = n.parent;
  return p.parent
      && p.parent.id
      && p.parent.id.name;
}

function requireWithImmediateCallWithoutVar(n) {
  // proxy = require('browsyquire')(require)
  var p = n.parent;
  return p.parent
      && p.parent.left
      && p.parent.left.name;
}

function findProxyquireVars(src) {
  var ret = detective
    .find(src, { nodes: true }).nodes
    .map(function (n) {
      var arg = n.arguments[0];

      return arg
        && arg.value  === 'browsyquire'
        && arg.type   === 'Literal'
        && ( simpleRequire(n) || requireWithImmediateCall(n) || requireWithImmediateCallWithoutVar(n) );
    })
    .filter(function (n) { return n; })
    ;

  return ret;
}

module.exports = function(src) {
  if (!hasRequire(src, 'browsyquire')) return [];

  // use hash to get unique values
  var hash = findProxyquireVars(src)
    .map(function (name) {
      return detective(src, { word: name });
    })
    .reduce(function (acc, arr) {
      arr.forEach(function (x) { acc[x] = true;});
      return acc;
    }, {});

  return Object.keys(hash);
};
