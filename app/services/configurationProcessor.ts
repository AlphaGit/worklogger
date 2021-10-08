import { LoggerFactory } from './LoggerFactory';
import { RelativeTime } from '../models/RelativeTime';
import { AppConfiguration } from '../models/AppConfiguration';
import { tz } from 'moment-timezone';

const logger = LoggerFactory.getLogger('services/configurationProcessor');

export function getProcessedConfiguration(configuration: AppConfiguration): AppConfiguration {
    const timePeriod = configuration.options.timePeriod;
    const { begin, end } = timePeriod;

    configuration.options.timeZone = configuration.options.timeZone || tz.guess();
    const timeZone = configuration.options.timeZone;

    timePeriod.startDateTime = parseAbsoluteTime(begin, timeZone) || parseRelativeTime(begin, timeZone) || parseOffset(begin, timeZone);
    timePeriod.endDateTime = parseAbsoluteTime(end, timeZone) || parseRelativeTime(end, timeZone) || parseOffset(end, timeZone);
    logger.info(`Range of dates to consider from inputs: ${timePeriod.startDateTime} - ${timePeriod.endDateTime}`);

    return configuration;
}

function parseRelativeTime(timePeriod, timeZone) {
    if (!timePeriod.fromNow || !timePeriod.unit) return null;

    const relativeTime = new RelativeTime(timePeriod.fromNow, timePeriod.unit, timeZone);
    return relativeTime.toDate();
}

function parseAbsoluteTime(timePeriod, timeZone) {
    const dateTimeString = timePeriod.dateTime;
    if (!(dateTimeString || '').length) return null;

    return tz(dateTimeString, timeZone).toDate();
}

function parseOffset(timePeriod, timeZone) {
    const offset = timePeriod.offset;
    if (!offset) return null;

    const { value, unit } = offset.match(/(?<value>(?:\+|-)?\d+)(?<unit>[mhwdM])?/).groups;

    return tz(timeZone).add(value, unit).toDate();
}