const logger = require('app/services/loggerFactory').getLogger('services/configurationProcessor');
const RelativeTime = require('app/models/RelativeTime');
const moment = require('moment');

function getProcessedConfiguration(configuration) {
    const timePeriod = configuration.options.timePeriod;
    const { begin, end } = timePeriod;

    timePeriod.startDateTime = parseAbsoluteTime(begin) || parseRelativeTime(begin) || parseOffset(begin);
    timePeriod.endDateTime = parseAbsoluteTime(end) || parseRelativeTime(end) || parseOffset(end);
    logger.info(`Range of dates to consider from inputs: ${timePeriod.startDateTime} - ${timePeriod.endDateTime}`);

    return configuration;
}

function parseRelativeTime(timePeriod) {
    if (!timePeriod.fromNow || !timePeriod.unit) return null;

    const relativeTime = new RelativeTime(timePeriod.fromNow, timePeriod.unit);
    return relativeTime.toDate();
}

function parseAbsoluteTime(timePeriod) {
    const dateTimeString = timePeriod.dateTime;
    if (!(dateTimeString || '').length) return null;

    return moment(dateTimeString).toDate();
}

function parseOffset(timePeriod) {
    const offset = timePeriod.offset;
    if (!offset) return null;

    const { value, unit } = offset.match(/(?<value>(?:\+|-)?\d+)(?<unit>[mhwdM])?/).groups;

    return moment().add(value, unit).toDate();
}

module.exports = {
    getProcessedConfiguration
};