var log4js = require('log4js');

var LogWrapper = function() {
    this.logger = log4js.getLogger('socket.io');
};
['error','warn','info','debug'].forEach(function (levelString) {
  LogWrapper.prototype[levelString] = function() {
    this.logger[levelString].apply(this.logger, arguments);
  }
});

module.exports = LogWrapper;