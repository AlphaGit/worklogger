class GoogleCalendarInputConfiguration {
    constructor(configurationInput) {
        if (!configurationInput.googleAccountName || !configurationInput.googleAccountPassword)
            throw "Account name and account password need to have a value";

        this.googleAccountName = configurationInput.googleAccountName;
        this.googleAccountPassword = configurationInput.googleAccountPassword;
    }
}

module.exports = GoogleCalendarInputConfiguration;
