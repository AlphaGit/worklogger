import { loadCondition } from './conditionLoader';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';
import { IAppConfiguration } from '../models/AppConfiguration';
import { OutputWithCondition } from './OutputWithCondition';
import { IFormatterConfig } from '../formatters/IFormatterConfig';
import { OutputBase } from '../outputs/OutputBase';
import { FormatterBase } from '../formatters/FormatterBase';
import { getLogger, LoggerCategory } from '../services/Logger';

const logger = getLogger(LoggerCategory.Services);

export async function loadOutputs(outputConfigurations: IOutputConfiguration[], appConfiguration: IAppConfiguration): Promise<OutputWithCondition[]> {
    return Promise.all(outputConfigurations.map(async outputConfig => {
        const output = await loadOuput(outputConfig, appConfiguration);
        const condition = await loadCondition(outputConfig.condition);
        const excludeFromNonProcessedWarning = !!outputConfig.excludeFromNonProcessedWarning;
        return { output, condition, excludeFromNonProcessedWarning };
    }));
}

async function loadOuput(outputConfiguration: IOutputConfiguration, appConfiguration: IAppConfiguration): Promise<OutputBase> {
    const outputType = outputConfiguration.type;
    const formatter = await loadFormatter(outputConfiguration.formatter, appConfiguration);

    const outputModule = await import(`../outputs/${outputType}/Output`);
    if (!outputModule.default)
        throw new Error(`Output module ${outputType} has no default export.`);

    return new outputModule.default(formatter, outputConfiguration, appConfiguration);
}

async function loadFormatter(formatterConfiguration: IFormatterConfig | undefined, appConfiguration: IAppConfiguration): Promise<FormatterBase> {
    if (!formatterConfiguration)
        formatterConfiguration = { type: 'NoFormat' };

    const formatterType = formatterConfiguration?.type || 'NoFormat';

    logger.debug(`Loading ${formatterType} formatter`);
    const formatterModule = await import(`../formatters/${formatterType}/Formatter`);
    if (!formatterModule.default)
        throw new Error(`Formatter module ${formatterType} has no default export.`);

    return new formatterModule.default(formatterConfiguration, appConfiguration);
}
