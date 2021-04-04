import { InputConfiguration } from './InputConfiguration';

export class AppConfigurationOptions {
    minimumLoggableTimeSlotInMinutes: number;
    timeZone: string;
}

export class AppConfiguration {
    options: AppConfigurationOptions;
    inputs: InputConfiguration[];
}
