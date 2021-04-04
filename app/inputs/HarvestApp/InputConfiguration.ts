import { HarvestInputConfiguration } from './HarvestInputConfiguration';

export class InputConfiguration {
    accountId: string;
    token: string;
    contactInformation: string;
    name: string;

    constructor(configurationInput: HarvestInputConfiguration) {
        if (!configurationInput)
            throw new Error('A configuration JSON is required.');

        this.accountId = configurationInput.accountId;
        this.token = configurationInput.token;
        this.contactInformation = configurationInput.contactInformation;
        this.name = configurationInput.name;
    }
}
