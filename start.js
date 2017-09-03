require('app-module-path').addPath(__dirname);

const logger = require('services/logger');
logger.debug('Application starting');

var inputLoader = require('./inputLoader');
var loadedInputs = inputLoader.loadInputs();

var worklogPromises = [];

for (let input of loadedInputs) {
    worklogPromises = worklogPromises.concat(input.getWorkLogs());
}

Promise.all(worklogPromises).then(worklogInputResult => {
    logger.info(`${worklogInputResult.length} inputs retrieved`);
    for (let worklogs of worklogInputResult) {
        logger.info(`${worklogs.length} worklogs retrieved`);
        for (let worklog of worklogs) {
            logger.debug(`Worklog: ${worklog}`);
        }
    }
}).catch((e) => logger.error(e));

