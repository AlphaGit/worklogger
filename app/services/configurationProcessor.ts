import { RelativeTime } from '../models/RelativeTime';
import { IAppConfiguration } from '../models/AppConfiguration';
import { TimeSpecification } from '../models';
import { tz, DurationInputArg2 } from 'moment-timezone';
import { getLogger, LoggerCategory } from '../services/Logger';

const logger = getLogger(LoggerCategory.Services);

export type ParsedTimeFrame = {
    start: Date;
    end: Date;
    timeZone: string;
};

export function getProcessedConfiguration(configuration: IAppConfiguration): ParsedTimeFrame {
    const { begin, end } = configuration.options.timePeriod;
    const timeZone = configuration.options.timeZone || tz.guess();

    const parsedStart = parseAbsoluteTime(begin, timeZone) || parseRelativeTime(begin, timeZone) || parseOffset(begin, timeZone);
    if (!parsedStart) {
        logger.error('Could not parse a proper start date. Configuration:', { begin });
        throw new Error('Could not parse a proper start date.');
    }

    const parsedEnd = parseAbsoluteTime(end, timeZone) || parseRelativeTime(end, timeZone) || parseOffset(end, timeZone);
    if (!parsedEnd) {
        logger.error('Could not parse a proper end date. Configuration:', { end });
        throw new Error('Could not parse a proper end date.');
    }

    logger.info(`Range of dates to consider from inputs: ${parsedStart} - ${parsedEnd}`);
    return { start: parsedStart, end: parsedEnd, timeZone };
}

function parseRelativeTime(timePeriod: TimeSpecification, timeZone: string) {
    const { fromNow, unit } = timePeriod;
    if (!fromNow || !unit) return null;

    const relativeTime = new RelativeTime(fromNow, unit, timeZone);
    return relativeTime.toDate();
}

function parseAbsoluteTime(timePeriod: TimeSpecification, timeZone: string) {
    const dateTimeString = timePeriod.dateTime;
    if (!(dateTimeString || '').length) return null;

    return tz(dateTimeString, timeZone).toDate();
}

function parseOffset(timePeriod: TimeSpecification, timeZone: string) {
    const offset = timePeriod.offset;
    if (!offset) return null;

    const match = offset.match(/(?<value>(?:\+|-)?\d+)(?<unit>[mhwdM])?/);
    if (!match) {
        throw new Error(`Unrecognized offset setting: ${offset}`);
    }
    const { value, unit } = match.groups as unknown as { value: number, unit: DurationInputArg2 };

    return tz(timeZone).add(value, unit).toDate();
}