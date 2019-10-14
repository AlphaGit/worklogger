(async () => {
    require('app-module-path/register');

    const WorklogSet = require('app/models/WorklogSet');

    const loggerFactory = require('app/services/loggerFactory');
    const logger = loggerFactory.getLogger('worklogger');
    logger.level = 'info';

    let environment = {
        transformations: []
    };

    try {
        await processArguments(environment);
        await loadConfiguration(environment);
        await configureLoggerFactory(environment);
        await loadFromInputs(environment);
        await createWorklogSet(environment);
        await loadActionsAndConditions(environment);
        await transformWorklogs(environment);
        await displayWorklogSet(environment);
        await loadOutputsAndFormattersAndConditions(environment);
        await outputWorklogSet(environment);
        await warnNonOuputProcessed(environment);

        logger.info('Done.');
    } catch (e) {
        logger.error(e);
    }

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
        const actionLoader = require('app/services/actionLoader');
        environment.transformations = actionLoader.loadActionsAndConditions(environment.appConfiguration.transformations);
    }

    function warnNonOuputProcessed(environment) {
        logger.debug('Checking for worklogs that do not match any output.');

        let worklogs = environment.worklogSet.worklogs;
        for (let { condition, excludeFromNonProcessedWarning } of environment.outputs) {
            if (excludeFromNonProcessedWarning) continue;

            worklogs = worklogs.filter(w => !condition.isSatisfiedBy(w));
        }

        if (worklogs.length === 0) {
            logger.info('All worklogs were processed by at least one output.');
        } else {
            logger.warn('The following worklogs were not processed by any output:');
            for (const worklog of worklogs) {
                logger.warn(worklog.toOneLinerString());
            }
        }
    }

    async function outputWorklogSet(environment) {
        logger.debug('Processing loaded outputs.');

        const outputPromises = [];
        for (let { output, condition } of environment.outputs) {
            const conditionFn = condition.isSatisfiedBy.bind(condition);
            const filteredWorklogSet = environment.worklogSet.getFilteredCopy(conditionFn);
            outputPromises.push(output.outputWorklogSet(filteredWorklogSet));
        }

        return await Promise.all(outputPromises);
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

    async function loadFromInputs(environment) {
        const inputLoader = require('app/services/inputLoader');
        const loadedInputs = inputLoader.loadInputs(environment.appConfiguration);
        const startDateTime = environment.appConfiguration.options.timePeriod.startDateTime;
        const endDateTime = environment.appConfiguration.options.timePeriod.endDateTime;

        const loaderFunctions = await loadedInputs.map(async i => await i.getWorkLogs(startDateTime, endDateTime));
        environment.worklogsPerInput = await Promise.all(loaderFunctions); // eslint-disable-line require-atomic-updates
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
})();