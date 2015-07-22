// "var proxy" before assignment

var proxy,
    path = require("path")

proxy = require("browsyquire")(require);

var depuno = proxy("./depuno", { path: { extname: function () { return 'blah'; } } });
