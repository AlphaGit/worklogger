module.exports = class FormatterBase {
    constructor(formatterConfiguration, appConfiguration) {
        if (!formatterConfiguration) throw new Error('Formatter configuration object is required.');
        this._configuration = formatterConfiguration;
        this._appConfiguration = appConfiguration;
    }

    format() {
        throw new Error('format() needs to be implemented in derived class.');
    }
};
