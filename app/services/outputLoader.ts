import { loadCondition } from './conditionLoader';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';
import { AppConfiguration } from '../models/AppConfiguration';
import { OutputWithCondition } from './OutputWithCondition';
import { IFormatterConfig } from '../formatters/IFormatterConfig';
import { OutputBase } from '../outputs/OutputBase';
import { FormatterBase } from '../formatters/FormatterBase';
import { getLogger } from 'log4js';

const logger = getLogger('services/outputLoader');

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
    const formatter = await loadFormatter(outputConfiguration.formatter, appConfiguration);

    const outputModule = await import(`app/outputs/${outputType}/Output`);
    return new outputModule.default(formatter, outputConfiguration, appConfiguration);
}

async function loadFormatter(formatterConfiguration: IFormatterConfig | undefined, appConfiguration: AppConfiguration): Promise<FormatterBase> {
    const formatterType = formatterConfiguration?.type || 'NoFormatFormatter';

    logger.debug(`Loading ${formatterType} formatter`);
    const formatterModule = await import(`app/formatters/${formatterType}`);

    return new formatterModule.default(formatterConfiguration, appConfiguration);
}
