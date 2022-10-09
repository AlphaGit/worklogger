import { Converter } from 'showdown';
import { WorklogSet } from '../../models/WorklogSet';
import { getLogger, LoggerCategory } from '../../services/Logger';
import { TableListFormatter } from '../TableList';
import { TableListHtmlFormatterConfiguration } from '.';

const logger = getLogger(LoggerCategory.Formatters);

export class TableListHtmlFormatter extends TableListFormatter {
    async format(worklogSet: WorklogSet): Promise<string> {
        const summaryText = await super.format(worklogSet);

        logger.debug('Initializing markdown converter');
        const configuration = this._configuration as TableListHtmlFormatterConfiguration;
        const markdownConverter = new Converter({
            ...configuration,
            tables: true,
        });

        logger.debug('Converting summary to html');
        const output = markdownConverter.makeHtml(summaryText);

        logger.debug('TableListHtmlFormatter output:', output);
        return output;
    }
}

export default TableListHtmlFormatter;