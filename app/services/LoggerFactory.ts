const log4jsSingletonSymbol = Symbol.for('worklogger.services.loggerFactory.log4js');

if (!global[log4jsSingletonSymbol]) {
    global[log4jsSingletonSymbol] = require('log4js');
}

export default global[log4jsSingletonSymbol];
