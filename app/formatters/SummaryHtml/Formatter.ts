import { Converter } from 'showdown';
import { WorklogSet } from '../../models/WorklogSet';
import { getLogger, LoggerCategory } from '../../services/Logger';
import { SummaryTextFormatter } from '../SummaryText';
import { SummaryHtmlFormatterConfiguration } from '.';

const logger = getLogger(LoggerCategory.Formatters);

export class SummaryHtmlFormatter extends SummaryTextFormatter {
    async format(worklogSet: WorklogSet): Promise<string> {
        const summaryText = await super.format(worklogSet);

        logger.debug('Initializing markdown converter');
        const configuration = this._configuration as SummaryHtmlFormatterConfiguration;
        const markdownConverter = new Converter(configuration);

        logger.debug('Converting summary to html');
        const output = markdownConverter.makeHtml(summaryText);

        logger.debug('SummaryHtmlFormatter output:', output);
        return output;
    }
}

export default SummaryHtmlFormatter;