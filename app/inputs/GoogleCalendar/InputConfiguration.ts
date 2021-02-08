import { GoogleCalendarCalendarConfiguration } from "./GoogleCalendarCalendarConfiguration";

export class InputConfiguration {
    public name: string;
    public storageRelativePath: string;
    private _calendars: GoogleCalendarCalendarConfiguration[];

    constructor(configurationInput: InputConfiguration) {
        if (!configurationInput)
            throw new Error('A configuration JSON is required.');

        this.name = configurationInput.name;
        this.calendars = configurationInput.calendars;
        this.storageRelativePath = configurationInput.storageRelativePath;
    }

    set calendars(value: GoogleCalendarCalendarConfiguration[]) {
        if (!Array.isArray(value))
            throw new Error('An array is required');

        if (!value || !value.length)
            throw new Error('Need at least one calendar.');

        for (let i = 0; i < value.length; i++) {
            const calendarId = value[i];

            if (!calendarId)
                throw new Error(`Calendar element ${i} (zero-based) does not have an id.`);
        }

        this._calendars = value;
    }

    get calendars(): GoogleCalendarCalendarConfiguration[] {
        return this._calendars;
    }
}
