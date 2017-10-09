const FormatterBase = require('formatters/FormatterBase');

module.exports = class OutputBase {
    constructor(formatter, outputConfiguration) {
        if (!(formatter instanceof FormatterBase))
            throw new Error('Formatter is required.');

        this._formatter = formatter;
        this._configuration = outputConfiguration;
    }

    outputWorklogSet() {
        throw new Error('outputWorklogSet() needs to be defined in derived classes.');
    }
};