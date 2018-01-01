const path = require('path');
const logger = require('app/services/loggerFactory').getLogger('services/configurationLoader');
const RelativeTime = require('app/models/RelativeTime');

function getProcessedConfiguration(relativePath) {
    const configuration = loadConfiguration(relativePath);
    detectDates(configuration);
    return configuration;
}

function loadConfiguration(relativePath) {
    const fullPath = path.resolve(relativePath);
    logger.info('Using configuration file:', fullPath);
    const configuration = require(fullPath);
    return configuration;
}

function detectDates(configuration) {
    const timePeriod = configuration.options.timePeriod;

    timePeriod.startDateTime = parseRelativeTime(timePeriod.begin);
    timePeriod.endDateTime = parseRelativeTime(timePeriod.end);
    logger.info(`Range of dates to consider from inputs: ${timePeriod.startDateTime} - ${timePeriod.endDateTime}`);

    return configuration;
}

function parseRelativeTime(timePeriod) {
    const relativeTime = new RelativeTime(timePeriod.fromNow, timePeriod.unit);
    return relativeTime.toDate();
}

module.exports = {
    getProcessedConfiguration
};