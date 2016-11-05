class GoogleCalendarInputConfiguration {
    constructor(configurationInput) {
        this.name = configurationInput.name;
        this.calendars = configurationInput.calendars;
        this.minimumLoggableTimeSlotInMinutes = configurationInput.minimumLoggableTimeSlotInMinutes;
    }

    set minimumLoggableTimeSlotInMinutes(value) {
        if (Number.isNaN(value) || value <= 0 || !Number.isInteger(value))
            throw 'MinimumTimeSlotMinutes needs to be a positive integer';

        this._minimumLoggableTimeSlotInMinutes = value;
    }

    get minimumLoggableTimeSlotInMinutes() {
        return this._minimumLoggableTimeSlotInMinutes;
    }

    set calendars(value) {
        if (!value || !value.length)
            throw 'Need at least one calendar.';

        for (var i = 0; i < value.length; i++) {
            var calendar = value[i];

            if (!calendar.id)
                throw `Calendar element ${i} (zero-based) does not have an id.`;

            if (!calendar.client)
                throw 'Calendar does not have a client assigned.';

            if (!calendar.project)
                throw 'Calendar does not have a project assigned.';
        }

        this._calendars = value;
    }

    get calendars() {
        return this._calendars;
    }
}

module.exports = GoogleCalendarInputConfiguration;
