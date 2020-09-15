module.exports = class InputConfiguration {
    constructor(configurationInput) {
        if (!configurationInput)
            throw new Error('A configuration JSON is required.');

        this.name = configurationInput.name;
        this.calendars = configurationInput.calendars;
        this.readFromXHoursAgo = configurationInput.readFromXHoursAgo;
        this.storageRelativePath = configurationInput.storageRelativePath;
    }

    set calendars(value) {
        if (!Array.isArray(value))
            throw new Error('An array is required');

        if (!value || !value.length)
            throw new Error('Need at least one calendar.');

        for (var i = 0; i < value.length; i++) {
            var calendarId = value[i];

            if (!calendarId)
                throw new Error(`Calendar element ${i} (zero-based) does not have an id.`);
        }

        this._calendars = value;
    }

    get calendars() {
        return this._calendars;
    }
};
