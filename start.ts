import { IAppConfiguration, IServiceRegistrations, Worklog, WorklogSet } from './app/models'
import { getLogger, configure as configureLogger } from 'log4js';
import { loadActionsAndConditions, IActionWithCondition } from './app/services/actionLoader';
import { getProcessedConfiguration, ParsedTimeFrame } from './app/services/configurationProcessor';
import { loadOutputs } from './app/services/outputLoader';
import { loadInputs } from './app/services/inputLoader';
import minimist from 'minimist';
import { S3FileLoader } from './app/services/FileLoader/S3FileLoader';
import { LocalFileLoader } from './app/services/FileLoader/LocalFileLoader';
import { OutputWithCondition } from './app/services/OutputWithCondition';

export async function start(receivedArguments: string[]): Promise<void> {
    const logger = getLogger('worklogger');

    logger.level = 'trace';

    try {
        const parsedArguments = await processArguments();
        const serviceRegistrations = await registerServices(parsedArguments);

        const appConfiguration = await loadConfiguration(parsedArguments, serviceRegistrations);
        configureLogger(appConfiguration.log4js);
        logger.info('Logger configuration initialized.');

        const timeFrame = getProcessedConfiguration(appConfiguration);
        const worklogsPerInput = await loadFromInputs(serviceRegistrations, appConfiguration, timeFrame);
        const worklogSet = await createWorklogSet(worklogsPerInput, timeFrame);
        const actions = await loadActions(appConfiguration);
        await transformWorklogs(actions, worklogSet);
        await displayWorklogSet(worklogSet);
        const outputs = await loadOutputsAndFormattersAndConditions(appConfiguration);
        await outputWorklogSet(outputs, worklogSet);
        await warnNonOuputProcessed(outputs, worklogSet);

        logger.info('Done.');
    } catch (e) {
        logger.error(e);
    }

    async function transformWorklogs(actions: IActionWithCondition[], worklogSet: WorklogSet): Promise<void> {
        for (const { action, condition } of actions) {
            for (const worklog of worklogSet.worklogs) {
                if (condition.isSatisfiedBy(worklog))
                    action.apply(worklog);
            }
        }
    }

    async function loadActions(appConfiguration: IAppConfiguration): Promise<IActionWithCondition[]> {
        return await loadActionsAndConditions(appConfiguration.transformations);
    }

    async function warnNonOuputProcessed(outputs: OutputWithCondition[], worklogSet: WorklogSet): Promise<void> {
        logger.debug('Checking for worklogs that do not match any output.');

        let worklogs = worklogSet.worklogs;
        for (const { condition, excludeFromNonProcessedWarning } of outputs) {
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

    async function outputWorklogSet(outputs: OutputWithCondition[], worklogSet: WorklogSet): Promise<void> {
        logger.debug('Processing loaded outputs.');

        const outputPromises = [];
        for (const { output, condition } of outputs) {
            const conditionFn = condition.isSatisfiedBy.bind(condition);
            const filteredWorklogSet = worklogSet.getFilteredCopy(conditionFn);
            outputPromises.push(output.outputWorklogSet(filteredWorklogSet));
        }

        await Promise.all(outputPromises);
    }

    async function displayWorklogSet(worklogSet: WorklogSet): Promise<void> {
        logger.info(`Transformed worklogs: ${worklogSet.worklogs.length} worklogs`);
        for (const worklog of worklogSet.worklogs) {
            logger.debug(`Worklog: ${worklog}`);
        }
    }

    async function loadOutputsAndFormattersAndConditions(appConfiguration: IAppConfiguration): Promise<OutputWithCondition[]> {
        return await loadOutputs(appConfiguration.outputs, appConfiguration);
    }

    async function loadFromInputs(serviceRegistrations: IServiceRegistrations, appConfiguration: IAppConfiguration, timeFrame: ParsedTimeFrame): Promise<Worklog[][]> {
        const loadedInputs = await loadInputs(serviceRegistrations, appConfiguration);

        return await Promise.all(loadedInputs.map(async i => {
            const retrievedWorklogs = await i.getWorkLogs(timeFrame.start, timeFrame.end);
            logger.debug(`Worklogs retrieved from ${i.name}: `);
            for (const worklog of retrievedWorklogs) {
                logger.debug(`- ${worklog.toOneLinerString()}`);
            }
            return retrievedWorklogs;
        }));
    }

    async function createWorklogSet(worklogsPerInput: Worklog[][], timeFrame: ParsedTimeFrame): Promise<WorklogSet> {
        const flattenedWorklogs = Array.prototype.concat(...worklogsPerInput);

        return new WorklogSet(timeFrame.start, timeFrame.end, flattenedWorklogs);
    }

    async function loadConfiguration(parsedArguments: minimist.ParsedArgs, serviceRegistrations: IServiceRegistrations): Promise<IAppConfiguration> {
        const configurationFilePath = parsedArguments.c || 'configuration.json';
        const fileLoader = serviceRegistrations.FileLoader;
        return <IAppConfiguration><unknown>(await fileLoader.loadJson(configurationFilePath));
        // TODO Pending: Logger config is not set yet, so this trace is always shown. 
        // logger.trace('Loaded configuration:', configurationContents);
    }

    async function processArguments(): Promise<minimist.ParsedArgs> {
        logger.debug('Received arguments', receivedArguments);
        const parsedArguments = minimist(receivedArguments);
        logger.trace('Parsed arguments', parsedArguments);
        return parsedArguments;
    }

    async function registerServices(parsedArguments: minimist.ParsedArgs): Promise<IServiceRegistrations> {
        const s3Bucket = parsedArguments.s3;
        return {
            FileLoader: s3Bucket ? new S3FileLoader(s3Bucket) : new LocalFileLoader()
        } as IServiceRegistrations;
    }
}
