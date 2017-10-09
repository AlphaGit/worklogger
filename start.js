require('app-module-path').addPath(__dirname);

const WorklogSet = require('models/WorklogSet');
const RelativeTime = require('models/RelativeTime');

const logger = require('services/logger');

logger.debug('Application starting');

let environment = {
    transformations: []
};

Promise.resolve(environment)
    .then(processArguments)
    .then(loadConfiguration)
    .then(detectDates)
    .then(loadFromInputs)
    .then(createWorklogSet)
    .then(loadActionsAndConditions)
    .then(transformWorklogs)
    .then(displayWorklogSet)
    .then(loadOutputsAndFormatters)
    .then(outputWorklogSet)
    .catch((e) => logger.error(e));

function transformWorklogs(environment) {
    for (let {action /*, condition*/} of environment.transformations) {
        for (let worklog of environment.worklogSet.worklogs) {
            action.apply(worklog);
        }
    }

    return environment;
}

function loadActionsAndConditions(environment) {
    for (let transformation of environment.appConfiguration.transformations) {
        const actionType = transformation.action.type;
        logger.info('Loading action:', actionType);
        const actionClass = require(`actions/${actionType}`);
        const action = new actionClass(transformation.action);

        let conditionType = (transformation.condition || {}).type;
        if (!conditionType) conditionType = 'true';
        logger.info('Loading condition:', conditionType);
        const conditionClass = require(`conditions/${conditionType}`);
        const condition = new conditionClass(transformation.condition);

        environment.transformations.push({ action, condition });
    }

    return environment;
}

function outputWorklogSet(environment) {
    for (let output of environment.outputs) {
        output.outputWorklogSet(environment.worklogSet);
    }
}

function displayWorklogSet(environment) {
    const worklogSet = environment.worklogSet;

    logger.info(`${worklogSet.worklogs.length} worklogs retrieved`);
    for (let worklog of worklogSet.worklogs) {
        logger.debug(`Worklog: ${worklog}`);
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
    environment.startDateTime = parseRelativeTime(environment.appConfiguration.options.timePeriod.begin);
    environment.endDateTime = parseRelativeTime(environment.appConfiguration.options.timePeriod.end);
    logger.info(`Range of dates to consider from inputs: ${environment.startDateTime} - ${environment.endDateTime}`);

    return environment;
}

function parseRelativeTime(timePeriod) {
    const relativeTime = new RelativeTime(timePeriod.fromNow, timePeriod.unit);
    return relativeTime.toDate();
}

function loadConfiguration(environment) {
    const path = require('path');
    const configurationFilePath = path.resolve(environment.arguments.c || './configuration.json');
    logger.info('Using configuration file:', configurationFilePath);
    environment.appConfiguration = require(configurationFilePath);
    return environment;
}

function processArguments(environment) {
    const parseArgs = require('minimist');
    environment.arguments = parseArgs(process.argv.slice(2));

    return environment;
}