import { InputConfiguration } from "../../models";

export type GoogleCalendarConfiguration = InputConfiguration & {
    calendars: GoogleCalendarCalendarConfiguration[];
}

export type GoogleCalendarCalendarConfiguration = {
    id: string;
    includeTags: string[];
}

export default GoogleCalendarCalendarConfiguration;