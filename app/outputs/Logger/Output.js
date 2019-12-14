const OutputBase = require('app/outputs/OutputBase');
const LoggerFactoryRequired = require('app/services/loggerFactory');

module.exports = class LoggerOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { LoggerFactory = LoggerFactoryRequired } = {}) {
        super(formatter, outputConfiguration);

        this._logger = LoggerFactory.getLogger('Logger/Output');
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        this._logger.info(formattedOutput);
    }
};