const log4js = require('log4js');

log4js.configure('log4jsconfig.json');

module.exports = log4js.getLogger();
