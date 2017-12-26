const OutputBase = require('outputs/OutputBase');
const LoggerFactoryRequired = require('services/loggerFactory');

module.exports = class LoggerOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { LoggerFactory = LoggerFactoryRequired } = {}) {
        super(formatter, outputConfiguration);

        this._logger = LoggerFactory.getLogger('Logger/Output');
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        this._logger.info(`WorklogSet: ${worklogSet}`);

        worklogSet.worklogs.forEach(w => {
            this._logger.info(w.toOneLinerString());
        });
    }
};