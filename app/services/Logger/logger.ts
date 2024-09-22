import log4js from 'log4js';

export enum LoggerCategory {
    App = 'app',
    Actions = 'actions',
    Conditions = 'conditions',
    Formatters = 'formatters',
    Inputs = 'inputs',
    Outputs = 'outputs',
    Services = 'services',
}

export function getLogger(category: LoggerCategory): log4js.Logger {
    return log4js.getLogger(category.toString());
}

export function configureLogger(configuration: log4js.Configuration): void {
    log4js.configure(configuration);
}