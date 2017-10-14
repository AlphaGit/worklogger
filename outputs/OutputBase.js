const FormatterBase = require('formatters/FormatterBase');
const WorklogSet = require('models/WorklogSet');

module.exports = class OutputBase {
    constructor(formatter, outputConfiguration) {
        if (!(formatter instanceof FormatterBase))
            throw new Error('Formatter is required.');

        this._formatter = formatter;
        this._configuration = outputConfiguration;
    }

    outputWorklogSet(worklogSet) {
        if (!worklogSet)
            throw new Error('Required parameter: worklogSet.');

        if (!(worklogSet instanceof WorklogSet))
            throw new Error('worklogSet needs to be of type WorklogSet.');

        throw new Error('outputWorklogSet() needs to be defined in derived classes.');
    }
};