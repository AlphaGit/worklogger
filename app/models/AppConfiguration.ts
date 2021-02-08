import { InputConfiguration } from './InputConfiguration';

export class AppConfigurationOptions {
    minimumLoggableTimeSlotInMinutes: number;
}

export class AppConfiguration {
    options: AppConfigurationOptions;
    inputs: InputConfiguration[];
}
