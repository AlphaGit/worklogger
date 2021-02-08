import { InputConfiguration } from "./../../models/InputConfiguration";

export class GoogleCalendarConfiguration extends InputConfiguration {
    calendars: GoogleCalendarCalendarConfiguration[];
}

export class GoogleCalendarCalendarConfiguration  {
    id: string;
    includeTags: string[];
}