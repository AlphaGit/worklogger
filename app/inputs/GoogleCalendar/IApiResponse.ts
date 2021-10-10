import googleApis from 'googleapis';
import { GoogleCalendarCalendarConfiguration } from './InputConfiguration';

export interface IApiResponse {
    calendarConfig: GoogleCalendarCalendarConfiguration;
    events: googleApis.calendar_v3.Schema$Event[];
}
