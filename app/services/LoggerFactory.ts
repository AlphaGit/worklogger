// TODO: Remove LoggerFactory, replace by import { getLogger } from 'log4js'

const log4jsSingletonSymbol = Symbol.for('worklogger.services.loggerFactory.log4js');

if (!global[log4jsSingletonSymbol]) {
    global[log4jsSingletonSymbol] = require('log4js');
}

export const LoggerFactory = global[log4jsSingletonSymbol];

export const getLogger = LoggerFactory.getLogger;