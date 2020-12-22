export class FormatterBase {
    private configuration: any;
    private appConfiguration: any;

    constructor(formatterConfiguration, appConfiguration) {
        if (!formatterConfiguration) throw new Error('Formatter configuration object is required.');
        this.configuration = formatterConfiguration;
        this.appConfiguration = appConfiguration;
    }

    public format(worklogSet) {
        throw new Error('format() needs to be implemented in derived class.');
    }
};
