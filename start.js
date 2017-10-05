require('app-module-path').addPath(__dirname);

const WorklogSet = require('models/WorklogSet');

const logger = require('services/logger');

logger.debug('Application starting');

let environment = {};

Promise.resolve(environment)
    .then(loadConfiguration)
    .then(detectDates)
    .then(loadFromInputs)
    .then(displayWorklogs)
    .then(createWorklogSet)
    //.then transformations
    .then(loadOutputsAndFormatters)
    .then(outputWorklogSet)
    .catch((e) => logger.error(e));

function outputWorklogSet(environment) {
    for (let output of environment.outputs) {
        output.outputWorklogSet(environment.worklogSet);
    }
}

function displayWorklogs(environment) {
    const worklogsPerInput = environment.worklogsPerInput;

    logger.info(`${worklogsPerInput.length} inputs retrieved`);
    for (let worklogs of worklogsPerInput) {
        logger.info(`${worklogs.length} worklogs retrieved`);
        for (let worklog of worklogs) {
            logger.debug(`Worklog: ${worklog}`);
        }
    }

    return environment;
}

function loadOutputsAndFormatters(environment) {
    const outputLoader = require('./outputLoader');
    environment.outputs = [];
    for (let outputConfig of environment.appConfiguration.outputs) {
        const configuredOutput = outputLoader.load(outputConfig);
        environment.outputs.push(configuredOutput);
    }
    return environment;
}

function loadFromInputs(environment) {
    const inputLoader = require('./inputLoader');
    const loadedInputs = inputLoader.loadInputs(environment.appConfiguration);
    return Promise.all(loadedInputs.map(i => i.getWorkLogs(environment.startDateTime, environment.endDateTime)))
        .then(worklogsPerInput => {
            environment.worklogsPerInput = worklogsPerInput;
            return environment;
        });
}

function createWorklogSet(environment) {
    const flattenedWorklogs = Array.prototype.concat(...environment.worklogsPerInput);
    environment.worklogSet = new WorklogSet(environment.startDateTime, environment.endDateTime, flattenedWorklogs);
    return environment;
}

function detectDates(environment) {
    const hoursAgo = environment.appConfiguration.options.fromHowManyHoursAgo;
    const endDateTime = new Date();
    const startDateTime = new Date(+endDateTime - (hoursAgo * 60 * 60 * 1000));
    logger.info(`Range of dates to consider from inputs: ${startDateTime} - ${endDateTime}`);

    environment.startDateTime = startDateTime;
    environment.endDateTime = endDateTime;

    return environment;
}

function loadConfiguration(environment) {
    environment.appConfiguration = require('./configuration.json');
    return environment;
}
