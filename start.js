require('app-module-path').addPath(__dirname);

const ApplicationConfiguration = require('model/ApplicationConfiguration');
const logger = require('services/logger');

logger.debug('Application starting');

var inputLoader = require('./inputLoader');

ApplicationConfiguration.getConfiguration('./configuration.json').then(appConfiguration => {
    var loadedInputs = inputLoader.loadInputs(appConfiguration);

    var worklogPromises = [];

    for (let input of loadedInputs) {
        worklogPromises = worklogPromises.concat(input.getWorkLogs());
    }

    return Promise.all(worklogPromises).then(worklogInputResult => {
        logger.info(`${worklogInputResult.length} inputs retrieved`);
        for (let worklogs of worklogInputResult) {
            logger.info(`${worklogs.length} worklogs retrieved`);
            for (let worklog of worklogs) {
                logger.debug(`Worklog: ${worklog}`);
            }
        }
    });
}).catch((e) => logger.error(e));

