import { LoggerFactory } from './LoggerFactory';
import { loadCondition } from './conditionLoader';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';
import { AppConfiguration } from '../models/AppConfiguration';
import { OutputWithCondition } from './OutputWithCondition';
import { IFormatterConfig } from '../formatters/IFormatterConfig';
import { OutputBase } from '../outputs/OutputBase';
import { FormatterBase } from '../formatters/FormatterBase';

const logger = LoggerFactory.getLogger('services/outputLoader');

export async function loadOutputs(outputConfigurations: IOutputConfiguration[], appConfiguration: AppConfiguration): Promise<OutputWithCondition[]> {
    return Promise.all(outputConfigurations.map(async outputConfig => {
        const output = await loadOuput(outputConfig, appConfiguration);
        const condition = await loadCondition(outputConfig.condition);
        const excludeFromNonProcessedWarning = !!outputConfig.excludeFromNonProcessedWarning;
        return { output, condition, excludeFromNonProcessedWarning };
    }));
}

async function loadOuput(outputConfiguration: IOutputConfiguration, appConfiguration: AppConfiguration): Promise<OutputBase> {
    const outputType = outputConfiguration.type;
    const formatter = loadFormatter(outputConfiguration.formatter, appConfiguration);

    const OutputClass = await import(`app/outputs/${outputType}/Output`);
    return new OutputClass(formatter, outputConfiguration, appConfiguration);
}

async function loadFormatter(formatterConfiguration: IFormatterConfig | undefined, appConfiguration: AppConfiguration): Promise<FormatterBase> {
    const formatterType = formatterConfiguration?.type || 'NoFormatFormatter';

    logger.debug(`Loading ${formatterType} formatter`);
    const FormatterClass = await import(`app/formatters/${formatterType}`);

    return new FormatterClass(formatterConfiguration, appConfiguration);
}
