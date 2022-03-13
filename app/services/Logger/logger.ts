import { Logger, getLogger as log4jsGetLogger, configure as log4jsConfigureLogger, Configuration } from 'log4js';

export enum LoggerCategory {
    App = 'app',
    Actions = 'actions',
    Conditions = 'conditions',
    Formatters = 'formatters',
    Inputs = 'inputs',
    Outputs = 'outputs',
    Services = 'services',
}

export function getLogger(category: LoggerCategory): Logger {
    return log4jsGetLogger(category.toString());
}

export function configureLogger(configuration: Configuration): void {
    log4jsConfigureLogger(configuration);
}