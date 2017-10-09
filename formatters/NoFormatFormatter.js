const FormatterBase = require('./FormatterBase');

module.exports = class NoFormatFormatter extends FormatterBase {
    format(worklogSet) {
        return worklogSet;
    }
};