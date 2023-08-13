export class Input {
    constructor(
        private serviceRegistrations: IServiceRegistrations,
        private appConfiguration: IAppConfiguration,
        private inputConfiguration: HarvestInputConfiguration
    ) {
        if (!appConfiguration)
            throw new Error('App configuration for Harvest App input is required.');

        if (!inputConfiguration)
            throw new Error('Input configuration for Harvest App input is required.');
        
        this.name = inputConfiguration.name;
    }

    get name(): string {
        return this.inputConfiguration.name;
    }
}