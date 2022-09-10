import { Converter } from 'showdown';
import { WorklogSet } from '../../models/WorklogSet';
import { getLogger, LoggerCategory } from '../../services/Logger';
import { SummaryTextFormatter } from '../SummaryText';
import { SummaryHtmlFormatterConfiguration } from '.';

const logger = getLogger(LoggerCategory.Formatters);

export class SummaryHtmlFormatter extends SummaryTextFormatter {
    format(worklogSet: WorklogSet): string {
        const summaryText = super.format(worklogSet);

        logger.debug('Initializing markdown converter');
        const configuration = this._configuration as SummaryHtmlFormatterConfiguration;
        const markdownConverter = new Converter(configuration);

        logger.debug('Converting summary to html');
        return markdownConverter.makeHtml(summaryText);
    }
}

export default SummaryHtmlFormatter;