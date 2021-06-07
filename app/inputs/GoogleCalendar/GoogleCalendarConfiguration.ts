import { InputConfiguration } from "../../models";

export class GoogleCalendarConfiguration extends InputConfiguration {
    calendars: GoogleCalendarCalendarConfiguration[];
}

export class GoogleCalendarCalendarConfiguration  {
    id: string;
    includeTags: string[];
}