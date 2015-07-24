var through          =  require('through');
module.exports = function (file, opts) {
  if (file === require.resolve('../index')) return through();
  if (/\.json$/.test(file)) return through();
  var data = '';

  return through(write, end);

  function write (buf) { data += buf; }
  function end() {
    if (data.match(/mockquire/g)) {
      this.queue('/* automatic insertion of the mockquire variable */ var mockquire = require("browsyquire")(require); mockquire.noCallThru(); /* end */');
    }
    //var deps = requireDependencies(data);
    //this.queue(deps);
    this.queue(data);
    this.queue(null);
  }
}
