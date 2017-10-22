require('app-module-path').addPath(__dirname);

const WorklogSet = require('models/WorklogSet');
const RelativeTime = require('models/RelativeTime');

const loggerFactory = require('services/loggerFactory');
const logger = loggerFactory.getLogger('worklogger');
logger.level = 'info';

let environment = {
    transformations: []
};

Promise.resolve(environment)
    .then(processArguments)
    .then(loadConfiguration)
    .then(configureLoggerFactory)
    .then(detectDates)
    .then(loadFromInputs)
    .then(createWorklogSet)
    .then(loadActionsAndConditions)
    .then(transformWorklogs)
    .then(displayWorklogSet)
    .then(loadOutputsAndFormattersAndConditions)
    .then(outputWorklogSet)
    .then(() => logger.info('Done.'))
    .catch((e) => logger.error(e));

function configureLoggerFactory(environment) {
    loggerFactory.configure(environment.appConfiguration.log4js);
    logger.info('Logger configuration initialized.');

    return environment;
}

function transformWorklogs(environment) {
    for (let { action, condition } of environment.transformations) {
        for (let worklog of environment.worklogSet.worklogs) {
            if (condition.isSatisfiedBy(worklog))
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
    logger.info('Processing loaded outputs.');

    const outputPromises = [];
    for (let { output, condition } of environment.outputs) {
        const filteredWorklogSet = environment.worklogSet.getFilteredCopy(condition.isSatisfiedBy.bind(condition));
        outputPromises.push(output.outputWorklogSet(filteredWorklogSet));
    }

    return Promise.all(outputPromises)
        .then(() => environment);
}

function displayWorklogSet(environment) {
    const worklogSet = environment.worklogSet;

    logger.info(`${worklogSet.worklogs.length} worklogs retrieved`);
    for (let worklog of worklogSet.worklogs) {
        logger.trace(`Worklog: ${worklog}`);
    }

    return environment;
}

function loadOutputsAndFormattersAndConditions(environment) {
    const outputLoader = require('./outputLoader');
    environment.outputs = [];
    for (let outputConfig of environment.appConfiguration.outputs) {
        const output = outputLoader.load(outputConfig);

        let conditionType = (outputConfig.condition || {}).type;
        if (!conditionType) conditionType = 'true';
        logger.info('Loading condition:', conditionType);
        const conditionClass = require(`conditions/${conditionType}`);
        const condition = new conditionClass(outputConfig.condition);

        environment.outputs.push({ output, condition });
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
