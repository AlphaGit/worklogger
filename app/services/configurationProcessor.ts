import LoggerFactory from './LoggerFactory';

const logger = LoggerFactory.getLogger('services/configurationProcessor');

import { RelativeTime } from '../models/RelativeTime';
import { AppConfiguration } from '../models/AppConfiguration';
import moment from 'moment-timezone';

export function getProcessedConfiguration(configuration: AppConfiguration): AppConfiguration {
    const timePeriod = configuration.options.timePeriod;
    const { begin, end } = timePeriod;

    configuration.options.timeZone = configuration.options.timeZone || moment.tz.guess();
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

    return moment.tz(dateTimeString, timeZone).toDate();
}

function parseOffset(timePeriod, timeZone) {
    const offset = timePeriod.offset;
    if (!offset) return null;

    const { value, unit } = offset.match(/(?<value>(?:\+|-)?\d+)(?<unit>[mhwdM])?/).groups;

    return moment.tz(timeZone).add(value, unit).toDate();
}