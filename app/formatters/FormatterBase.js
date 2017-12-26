module.exports = class FormatterBase {
    constructor(formatterConfiguration) {
        if (!formatterConfiguration) throw new Error('Formatter configuration object is required.');
        this._configuration = formatterConfiguration;
    }

    format() {
        throw new Error('format() needs to be implemented in derived class.');
    }
};
