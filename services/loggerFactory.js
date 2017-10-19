const log4jsSingletonSymbol = Symbol.for('worklogger.services.loggerFactory.log4js');

if (!global[log4jsSingletonSymbol]) {
    global[log4jsSingletonSymbol] = require('log4js');
}

module.exports = global[log4jsSingletonSymbol];
