class GoogleCalendarInputConfiguration {
    constructor(configurationInput) {
        if (!configurationInput)
            throw new Error('A configuration JSON is required.');

        this.name = configurationInput.name;
        this.calendars = configurationInput.calendars;
    }

    set calendars(value) {
        if (!Array.isArray(value))
            throw new Error('An array is required');

        if (!value || !value.length)
            throw new Error('Need at least one calendar.');

        for (var i = 0; i < value.length; i++) {
            var calendar = value[i];

            if (!calendar.id)
                throw new Error(`Calendar element ${i} (zero-based) does not have an id.`);

            if (!calendar.client)
                throw new Error('Calendar does not have a client assigned.');

            if (!calendar.project)
                throw new Error('Calendar does not have a project assigned.');
        }

        this._calendars = value;
    }

    get calendars() {
        return this._calendars;
    }
}

module.exports = GoogleCalendarInputConfiguration;
