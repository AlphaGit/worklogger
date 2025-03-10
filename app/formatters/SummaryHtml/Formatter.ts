import showdown from 'showdown';
import { WorklogSet } from '../../models/WorklogSet';
import { getLogger, LoggerCategory } from '../../services/Logger';
import { SummaryTextFormatter } from '../SummaryText';
import { SummaryHtmlFormatterConfiguration } from '.';
import { Worklog } from '../../models/Worklog';

const logger = getLogger(LoggerCategory.Formatters);

export class SummaryHtmlFormatter extends SummaryTextFormatter {
    protected _configuration: SummaryHtmlFormatterConfiguration;

    _generateAggregationLines(worklogs: Worklog[], tags: string[], indentationLevel = 1): string[] {
        if (!worklogs || !worklogs.length || !tags || !tags.length) return [];

        // Apply filters for this tag group
        const filteredWorklogs = this._applyFilters(worklogs, tags);
        
        return super._generateAggregationLines(filteredWorklogs, tags, indentationLevel);
    }

    private _applyFilters(worklogs: Worklog[], tags: string[]): Worklog[] {
        const matchingFilters = this._configuration.filters.filter(f => 
            this._arraysHaveSameElements(f.tagNames, tags));

        if (!matchingFilters.length) {
            return worklogs;
        }

        return worklogs.filter(worklog => 
            matchingFilters.every(filter => filter.filter(worklog))
        );
    }

    private _arraysHaveSameElements(arr1: string[], arr2: string[]): boolean {
        if (arr1.length !== arr2.length) return false;
        const sorted1 = [...arr1].sort();
        const sorted2 = [...arr2].sort();
        return sorted1.every((element, index) => element === sorted2[index]);
    }

    async format(worklogSet: WorklogSet): Promise<string> {
        const summaryText = await super.format(worklogSet);

        logger.debug('Initializing markdown converter');
        const markdownConverter = new showdown.Converter(this._configuration);

        logger.debug('Converting summary to html');
        const output = markdownConverter.makeHtml(summaryText);

        logger.debug('SummaryHtmlFormatter output:', output);
        return output;
    }
}

export default SummaryHtmlFormatter;

const logger = getLogger(LoggerCategory.Formatters);

export class SummaryHtmlFormatter extends SummaryTextFormatter {
    async format(worklogSet: WorklogSet): Promise<string> {
        const summaryText = await super.format(worklogSet);

        logger.debug('Initializing markdown converter');
        const configuration = this._configuration as SummaryHtmlFormatterConfiguration;
        const markdownConverter = new showdown.Converter(configuration);

        logger.debug('Converting summary to html');
        const output = markdownConverter.makeHtml(summaryText);

        logger.debug('SummaryHtmlFormatter output:', output);
        return output;
    }
}

export default SummaryHtmlFormatter;