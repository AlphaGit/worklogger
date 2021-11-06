import * as moment from "moment-timezone";
import { AppConfigurations } from "../../tests/entities";
import { TimeSpecification } from "../models";
import { getProcessedConfiguration } from "./configurationProcessor";

const appConfiguration = AppConfigurations.normal();

describe('getProcessedConfiguration', () => {
    test('detects the timezone if not specified in options', () => {
        const DateTimeFormat = Intl.DateTimeFormat;
        jest.spyOn(Intl, 'DateTimeFormat')
            .mockImplementation((locale, options) => new DateTimeFormat(locale, { ...options, timeZone: 'America/Chicago' }));

        const config = { ...appConfiguration, options: { ...appConfiguration.options, timeZone: '' } };
        const result = getProcessedConfiguration(config);

        jest.resetAllMocks();

        expect(result.timeZone).toBe('America/Chicago');
    });

    describe('sets the start and end time based on configuration', () => {
        test('with absolute dates', () => {
            const config = {
                ...appConfiguration,
                options: {
                    ...appConfiguration.options,
                    timePeriod: {
                        begin: {
                            dateTime: '2020-01-01T01:02:03Z'
                        } as TimeSpecification,
                        end: {
                            dateTime: '2020-01-02T01:02:03Z'
                        } as TimeSpecification,
                        startEndTime: undefined,
                        endDateTime: undefined
                    } 
                } 
            };
            const result = getProcessedConfiguration(config);

            expect(result.start).toStrictEqual(new Date('2020-01-01T01:02:03Z'));
            expect(result.end).toStrictEqual(new Date('2020-01-02T01:02:03Z'));
        });

        test('with fromNow/unit', () => {
            const config = {
                ...appConfiguration,
                options: {
                    ...appConfiguration.options,
                    timePeriod: {
                        begin: {
                            fromNow: 'last',
                            unit: 'day'
                        } as TimeSpecification,
                        end: {
                            fromNow: 'this',
                            unit: 'day'
                        } as TimeSpecification,
                        startEndTime: undefined,
                        endDateTime: undefined
                    } 
                } 
            };
            const result = getProcessedConfiguration(config);

            const timeZone = appConfiguration.options.timeZone
            expect(result.start).toStrictEqual(moment.tz(timeZone).subtract(1, 'day').startOf('day').toDate());
            expect(result.end).toStrictEqual(moment.tz(timeZone).startOf('day').toDate());
        });

        test('with offset', () => {
            const config = {
                ...appConfiguration,
                options: {
                    ...appConfiguration.options,
                    timePeriod: {
                        begin: {
                            offset: '-24h'
                        } as TimeSpecification,
                        end: {
                            offset: '0'
                        } as TimeSpecification,
                        startEndTime: undefined,
                        endDateTime: undefined
                    } 
                } 
            };
            const result = getProcessedConfiguration(config);

            expect(+result.start).toBeCloseTo(+moment.tz().subtract(24, 'hour').toDate(), -2);
            expect(+result.end).toBeCloseTo(+moment.tz().toDate(), -2);
        });
    });
});