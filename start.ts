import { WorklogSet } from 'app/models/WorklogSet';
import { getLogger } from 'log4js';

async function start(passedArguments: string | string[]) {
    const logger = getLogger('worklogger');

    logger.level = 'trace';

    const environment = {
        transformations: [],
        serviceRegistrations: {}
    };

    try {
        await processArguments(environment);
        await registerServices(environment);
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
        for (const { action, condition } of environment.transformations) {
            for (const worklog of environment.worklogSet.worklogs) {
                if (condition.isSatisfiedBy(worklog))
                    action.apply(worklog);
            }
        }
    }

    function loadActionsAndConditions(environment) {
        import { loadActionsAndConditions } from 'app/services/actionLoader';
        environment.transformations = loadActionsAndConditions(environment.appConfiguration.transformations);
    }

    function warnNonOuputProcessed(environment) {
        logger.debug('Checking for worklogs that do not match any output.');

        let worklogs = environment.worklogSet.worklogs;
        for (const { condition, excludeFromNonProcessedWarning } of environment.outputs) {
            if (excludeFromNonProcessedWarning) continue;

            worklogs = worklogs.filter(w => !condition.isSatisfiedBy(w));
        }

        if (worklogs.length === 0) {
            logger.info('All worklogs were processed by at least one output.');
        } else {
            logger.warn('The following worklogs were not processed by any output:');
            for (const worklog of worklogs) {
                logger.warn(`- ${worklog.toOneLinerString()}`);
            }
        }
    }

    async function outputWorklogSet(environment) {
        logger.debug('Processing loaded outputs.');

        const outputPromises = [];
        for (const { output, condition } of environment.outputs) {
            const conditionFn = condition.isSatisfiedBy.bind(condition);
            const filteredWorklogSet = environment.worklogSet.getFilteredCopy(conditionFn);
            outputPromises.push(output.outputWorklogSet(filteredWorklogSet));
        }

        return await Promise.all(outputPromises);
    }

    function displayWorklogSet(environment) {
        const worklogSet = environment.worklogSet;

        logger.info(`Transformed worklogs: ${worklogSet.worklogs.length} worklogs`);
        for (const worklog of worklogSet.worklogs) {
            logger.debug(`Worklog: ${worklog}`);
        }
    }

    function loadOutputsAndFormattersAndConditions(environment) {
        import { loadOutputs } from 'app/services/outputLoader';
        environment.outputs = loadOutputs(environment.appConfiguration.outputs, environment.appConfiguration);
    }

    async function loadFromInputs(environment) {
        import { loadInputs } from 'app/services/inputLoader';
        const loadedInputs = loadInputs(environment.serviceRegistrations, environment.appConfiguration);
        const startDateTime = environment.appConfiguration.options.timePeriod.startDateTime;
        const endDateTime = environment.appConfiguration.options.timePeriod.endDateTime;

        const loaderFunctions = await loadedInputs.map(async i => {
            const retrievedWorklogs = await i.getWorkLogs(startDateTime, endDateTime);
            logger.debug(`Worklogs retrieved from ${i.name}: `);
            for (const worklog of retrievedWorklogs) {
                logger.debug(`- ${worklog.toOneLinerString()}`);
            }
            return retrievedWorklogs;
        });
        environment.worklogsPerInput = await Promise.all(loaderFunctions); // eslint-disable-line require-atomic-updates
    }

    function createWorklogSet(environment) {
        const flattenedWorklogs = Array.prototype.concat(...environment.worklogsPerInput);
        const startDateTime = environment.appConfiguration.options.timePeriod.startDateTime;
        const endDateTime = environment.appConfiguration.options.timePeriod.endDateTime;

        environment.worklogSet = new WorklogSet(startDateTime, endDateTime, flattenedWorklogs);
    }

    async function loadConfiguration(environment) {
        const configurationFilePath = environment.arguments.c || 'configuration.json';
        const fileLoader = environment.serviceRegistrations.FileLoader;
        const configurationContents = await fileLoader.loadJson(configurationFilePath);
        // TODO Pending: Logger config is not set yet, so this trace is always shown. 
        // logger.trace('Loaded configuration:', configurationContents);

        import { getProcessedConfiguration } from 'app/services/configurationProcessor';

        environment.appConfiguration = getProcessedConfiguration(configurationContents);
    }

    function processArguments(environment) {
        const receivedArguments = passedArguments;
        logger.debug(`Received arguments: ${receivedArguments}`);

        if (typeof receivedArguments === 'string' || Array.isArray(receivedArguments)) {
            import { minimist } from 'minimist';
            environment.arguments = minimist(receivedArguments);
            logger.trace('Parsed arguments', environment.arguments);
        } else if (typeof receivedArguments === 'object') {
            environment.arguments = receivedArguments;
            logger.trace('Using arguments', environment.arguments);
        } else {
            throw new Error('Received arguments type not recognized.');
        }
    }

    function registerServices(environment) {
        const s3Bucket = environment.arguments.s3;
        if (s3Bucket) {
            import { S3FileLoader } from 'app/services/FileLoader/S3FileLoader';
            environment.serviceRegistrations.FileLoader = new S3FileLoader(s3Bucket);
        } else {
            import { LocalFileLoader } from 'app/services/FileLoader/LocalFileLoader';
            environment.serviceRegistrations.FileLoader = new LocalFileLoader();
        }
    }
}

module.exports = {
    start
};