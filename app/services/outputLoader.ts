import { loadCondition } from './conditionLoader';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';
import { IAppConfiguration } from '../models/AppConfiguration';
import { OutputWithCondition } from './OutputWithCondition';
import { IFormatterConfig } from '../formatters/IFormatterConfig';
import { OutputBase } from '../outputs/OutputBase';
import { FormatterBase } from '../formatters/FormatterBase';
import { getLogger, LoggerCategory } from '../services/Logger';

const logger = getLogger(LoggerCategory.Services);

// Loading these eagerly because dynamic imports mess up with the webpack build.
import { AwsSesOutput } from '../outputs/AWS-SES';
import { HarvestAppOutput } from '../outputs/HarvestApp';
import { JiraWorklogOutput } from '../outputs/JiraWorklog';
import { LoggerOutput } from '../outputs/Logger';
import { TextFileOutput } from '../outputs/TextFile';

const outputClasses = {
    "AWS-SES": AwsSesOutput,
    "HarvestApp": HarvestAppOutput,
    "JiraWorklog": JiraWorklogOutput,
    "Logger": LoggerOutput,
    "TextFile": TextFileOutput
}

// Loading these eagerly because dynamic imports mess up with the webpack build.
import { FormatterAggregatorFormatter } from '../formatters/FormatterAggregator';
import { NoFormatFormatter } from '../formatters/NoFormat';
import { SummaryHtmlFormatter } from '../formatters/SummaryHtml';
import { SummaryTextFormatter } from '../formatters/SummaryText';
import { TableListFormatter } from '../formatters/TableList';
import { TableListHtmlFormatter } from '../formatters/TableListHtml';

const formatterClasses = {
    "FormatterAggregator": FormatterAggregatorFormatter,
    "NoFormat": NoFormatFormatter,
    "SummaryHtml": SummaryHtmlFormatter,
    "SummaryText": SummaryTextFormatter,
    "TableList": TableListFormatter,
    "TableListHtml": TableListHtmlFormatter
}

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

    const outputClass = outputClasses[outputType];
    if (!outputClass)
        throw new Error(`Output ${outputType} not recognized.`);

    return new outputClass(formatter, outputConfiguration, appConfiguration);
}

export async function loadFormatter(formatterConfiguration: IFormatterConfig | undefined, appConfiguration: IAppConfiguration): Promise<FormatterBase> {
    if (!formatterConfiguration)
        formatterConfiguration = { type: 'NoFormat' };

    const formatterType = formatterConfiguration?.type || 'NoFormat';

    logger.debug(`Loading ${formatterType} formatter`);

    const formatterClass = formatterClasses[formatterType];
    if (!formatterClass)
        throw new Error(`Formatter ${formatterType} not recognized.`);

    return new formatterClass(formatterConfiguration, appConfiguration);
}
