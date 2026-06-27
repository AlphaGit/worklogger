import { WorklogSet } from "../../models";
import { getLogger, LoggerCategory } from "../../services/Logger";
import { FormatterBase } from "../FormatterBase";
import { FormatterAggregatorFormatterConfiguration } from "./FormatterConfiguration";
import { loadFormatter } from "../../services/outputLoader";

const logger = getLogger(LoggerCategory.Formatters);

export class FormatterAggregatorFormatter extends FormatterBase {
    async format(worklogSet: WorklogSet): Promise<string> {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        const configuration = this._configuration as FormatterAggregatorFormatterConfiguration;
        logger.debug(`Formatting worklog set with ${configuration.formatters.length} formatters.`);
        const formatterPromises = configuration.formatters.map(config => loadFormatter(config, this._appConfiguration));
        const formatters = await Promise.all(formatterPromises);
        logger.debug(`Loaded ${formatters.length} formatters.`);

        const outputPromises = formatters.map(formatter => formatter.format(worklogSet));
        const outputs = await Promise.all(outputPromises);
        logger.debug(`Aggregated ${outputs.length} outputs.`);

        logger.debug(`Aggregated outputs: ${outputs.join('\n\n')}`);
        return outputs.join('\n\n');
    }
}

export default FormatterAggregatorFormatter;