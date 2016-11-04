class GoogleCalendarInputConfiguration {
    constructor(configurationInput) {
        if (!configurationInput.calendars || !configurationInput.calendars.length)
            throw `Google Calendar Input Configuration ${configurationInput.name} does not have calendars configured.`;

        var errorStringPrefix = `Google Calendar Input Configuration '${configurationInput.name}`;
        for (var i = 0; i < configurationInput.calendars.length; i++) {
            var calendar = configurationInput.calendars[i];

            if (!calendar.id)
                throw `${errorStringPrefix} calendar element ${i} (zero-based) does not have an id.`;

            errorStringPrefix = errorStringPrefix + `calendar element ${calendar.id}`;

            if (!calendar.client)
                throw `${errorStringPrefix} does not have a client assigned.`;

            if (!calendar.project)
                throw `${errorStringPrefix} does not have a project assigned.`;
        }

        this.calendars = configurationInput.calendars;
    }
}

module.exports = GoogleCalendarInputConfiguration;
