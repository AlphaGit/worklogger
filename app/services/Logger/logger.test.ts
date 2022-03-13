import { getLogger, LoggerCategory, configureLogger } from './logger';
import { getLogger as getLoggerMock, configure as configureMock } from 'log4js';

jest.mock('log4js', () => ({
    getLogger: jest.fn(),
    configure: jest.fn()
}));

beforeEach(() => {
    jest.resetModules();
});

describe('getLogger', () => {
    test('returns a logger from log4js', () => {
        getLogger(LoggerCategory.App);
        expect(getLoggerMock).toBeCalledWith(LoggerCategory.App.toString());
    });
});

describe('configureLogger', () => {
    test('configures log4js', () => {
        const configuration = {
            appenders: {
                app: {
                    type: 'file',
                    filename: 'test.log'
                }
            },
            categories: {
                default: {
                    appenders: ['app'],
                    level: 'info'
                }
            }
        };

        configureLogger(configuration);
        expect(configureMock).toBeCalledWith(configuration);
    });
});
