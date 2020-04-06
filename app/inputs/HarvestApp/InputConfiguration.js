module.exports = class InputConfiguration {
    constructor(configurationInput) {
        if (!configurationInput)
            throw new Error('A configuration JSON is required.');

        this.accountId = configurationInput.accountId;
        this.token = configurationInput.token;
        this.contactInformation = configurationInput.contactInformation;
    }
};