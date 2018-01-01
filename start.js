require('app-module-path/register');

const WorklogSet = require('app/models/WorklogSet');

const loggerFactory = require('app/services/loggerFactory');
const logger = loggerFactory.getLogger('worklogger');
logger.level = 'info';

let environment = {
    transformations: []
};

Promise.resolve(environment)
    .then(environmentChain(processArguments))
    .then(environmentChain(loadConfiguration))
    .then(environmentChain(configureLoggerFactory))
    .then(environmentChain(loadFromInputs))
    .then(environmentChain(createWorklogSet))
    .then(environmentChain(loadActionsAndConditions))
    .then(environmentChain(transformWorklogs))
    .then(environmentChain(displayWorklogSet))
    .then(environmentChain(loadOutputsAndFormattersAndConditions))
    .then(environmentChain(outputWorklogSet))
    .then(() => logger.info('Done.'))
    .catch((e) => logger.error(e));

function configureLoggerFactory(environment) {
    loggerFactory.configure(environment.appConfiguration.log4js);
    logger.info('Logger configuration initialized.');
}

function transformWorklogs(environment) {
    for (let { action, condition } of environment.transformations) {
        for (let worklog of environment.worklogSet.worklogs) {
            if (condition.isSatisfiedBy(worklog))
                action.apply(worklog);
        }
    }
}

function loadActionsAndConditions(environment) {
    for (let transformation of environment.appConfiguration.transformations) {
        const actionType = transformation.action.type;
        logger.info('Loading action:', actionType);
        const actionClass = require(`app/actions/${actionType}`);
        const action = new actionClass(transformation.action);

        let conditionType = (transformation.condition || {}).type;
        if (!conditionType) conditionType = 'true';
        logger.info('Loading condition:', conditionType);
        const conditionClass = require(`app/conditions/${conditionType}`);
        const condition = new conditionClass(transformation.condition);

        environment.transformations.push({ action, condition });
    }
}

function outputWorklogSet(environment) {
    logger.info('Processing loaded outputs.');

    const outputPromises = [];
    for (let { output, condition } of environment.outputs) {
        const filteredWorklogSet = environment.worklogSet.getFilteredCopy(condition.isSatisfiedBy.bind(condition));
        outputPromises.push(output.outputWorklogSet(filteredWorklogSet));
    }

    return Promise.all(outputPromises);
}

function displayWorklogSet(environment) {
    const worklogSet = environment.worklogSet;

    logger.info(`${worklogSet.worklogs.length} worklogs retrieved`);
    for (let worklog of worklogSet.worklogs) {
        logger.trace(`Worklog: ${worklog}`);
    }
}

function loadOutputsAndFormattersAndConditions(environment) {
    const outputLoader = require('app/services/outputLoader');
    environment.outputs = outputLoader.loadOutputs(environment.appConfiguration.outputs);
}

function loadFromInputs(environment) {
    const inputLoader = require('./inputLoader');
    const loadedInputs = inputLoader.loadInputs(environment.appConfiguration);
    const startDateTime = environment.appConfiguration.options.timePeriod.startDateTime;
    const endDateTime = environment.appConfiguration.options.timePeriod.endDateTime;

    return Promise.all(loadedInputs.map(i => i.getWorkLogs(startDateTime, endDateTime)))
        .then(worklogsPerInput => {
            environment.worklogsPerInput = worklogsPerInput;
        });
}

function createWorklogSet(environment) {
    const flattenedWorklogs = Array.prototype.concat(...environment.worklogsPerInput);
    const startDateTime = environment.appConfiguration.options.timePeriod.startDateTime;
    const endDateTime = environment.appConfiguration.options.timePeriod.endDateTime;

    environment.worklogSet = new WorklogSet(startDateTime, endDateTime, flattenedWorklogs);
}

function loadConfiguration(environment) {
    const configurationLoader = require('app/services/configurationLoader');
    environment.appConfiguration = configurationLoader.getProcessedConfiguration(environment.arguments.c || './configuration.json');
}

function processArguments(environment) {
    const parseArgs = require('minimist');
    environment.arguments = parseArgs(process.argv.slice(2));
}

function environmentChain(func) {
    return function environmentChainWrapper() {
        return Promise.resolve(func(environment))
            .then(() => environment);
    }
}