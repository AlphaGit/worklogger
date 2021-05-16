import { InputConfiguration } from './InputConfiguration';

export class AppConfigurationOptions {
    minimumLoggableTimeSlotInMinutes: number;
    timeZone: string;
    timePeriod: {
        begin: string;
        end: string;
        startDateTime: Date;
        endDateTime: Date;
    };
}

export class AppConfiguration {
    options: AppConfigurationOptions;
    inputs: InputConfiguration[];
}
