export class InputConfiguration {
    private calendars: any;
    private storageRelativePath: string;
    private name: string;

    constructor(configurationInput) {
        if (!configurationInput)
            throw new Error('A configuration JSON is required.');

        this.name = configurationInput.name;
        this.calendars = configurationInput.calendars;
        this.storageRelativePath = configurationInput.storageRelativePath;
    }
};
