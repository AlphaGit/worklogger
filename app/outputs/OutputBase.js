const FormatterBase = require('app/formatters/FormatterBase');
const WorklogSet = require('app/models/WorklogSet');

module.exports = class OutputBase {
    constructor(formatter, outputConfiguration, appConfiguration) {
        if (!(formatter instanceof FormatterBase)) throw new Error('Formatter is required.');

        this._formatter = formatter;
        this._configuration = outputConfiguration;
        this._appConfiguration = appConfiguration;
    }

    outputWorklogSet(worklogSet) {
        this._outputWorklogSetValidation(worklogSet);
        throw new Error('outputWorklogSet() needs to be defined in derived classes.');
    }

    _outputWorklogSetValidation(worklogSet) {
        if (!worklogSet) throw new Error('Required parameter: worklogSet.');
        if (!(worklogSet instanceof WorklogSet)) throw new Error('worklogSet needs to be of type WorklogSet.');
    }
};