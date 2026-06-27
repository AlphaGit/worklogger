import { InputConfiguration } from './InputConfiguration';
import { Configuration as LoggerConfiguration } from 'log4js';
import { ITransformation } from '../services/actionLoader';
import { FromNow, Unit } from './RelativeTime';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';

export type TimeSpecification = {
    fromNow?: FromNow,
    unit?: Unit,
    dateTime?: string,
    offset?: string
};

export type AppConfigurationOptions = {
    minimumLoggableTimeSlotInMinutes: number;
    timeZone: string;
    timePeriod: {
        begin: TimeSpecification;
        end: TimeSpecification;
    };
}

export interface IAppConfiguration {
    options: AppConfigurationOptions;
    inputs: InputConfiguration[];
    log4js: LoggerConfiguration;
    transformations: ITransformation[];
    outputs: IOutputConfiguration[];
}
