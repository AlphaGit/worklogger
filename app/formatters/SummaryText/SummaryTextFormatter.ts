import { WorklogSet } from '../../models/WorklogSet';
import { FormatterBase } from '../FormatterBase';
import { LoggerFactory } from '../../services/LoggerFactory';
import { Worklog } from '../../models/Worklog';
import { SummaryTextFormatterConfiguration } from './SummaryTextFormatterConfiguration';
import * as moment from 'moment-timezone';

const logger = LoggerFactory.getLogger('SummaryTextFormatter');

export class SummaryTextFormatter extends FormatterBase {
    format(worklogSet: WorklogSet): string {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        let outputLines: string[] = [];

        const timeZone = this._appConfiguration.options.timeZone;
        const startDateTime = moment.tz(worklogSet.startDateTime, timeZone).format();
        const endDateTime = moment.tz(worklogSet.endDateTime, timeZone).format();
        outputLines.push(`Worklogs from ${startDateTime} to ${endDateTime}.`);
        outputLines.push('');

        const aggregations = this._generateAggregations(worklogSet);
        if (aggregations.length) { 
            outputLines = outputLines.concat(...aggregations);
        }

        const totalDurationMinutes = this._getWorklogDurationSumInMinutes(worklogSet.worklogs);
        const totalDurationString = this._getTotalHsMsString(totalDurationMinutes);
        outputLines.push(`Total time: ${totalDurationString}`);

        const output = outputLines.join('\n');
        logger.debug('SummaryTextFormatter output:', output);
        return output;
    }

    _getWorklogDurationSumInMinutes(worklogs: Worklog[]): number {
        return worklogs
            .map(w => w.getDurationInMinutes())
            .reduce((d1, d2) => d1 + d2, 0);
    }

    _getTotalHsMsString(totalDurationMinutes: number): string {
        const totalHours = Math.round(totalDurationMinutes / 60);
        const minutes = Math.round(totalDurationMinutes % 60);

        return `${totalHours}hs ${minutes}m`;
    }

    _generateAggregations(worklogSet: WorklogSet): string[][] {
        const configuration = this._configuration as SummaryTextFormatterConfiguration;

        if (!configuration.aggregateByTags) return [];

        return configuration.aggregateByTags
            .map(tags => {
                const aggregationLines = this._generateAggregationLines(worklogSet.worklogs, tags);
                return [
                    `Total time by ${tags.join(' / ')}:`,
                    '',
                    ...aggregationLines,
                    ''
                ];
            });
    }

    _generateAggregationLines(worklogs: Worklog[], tags: string[], indentationLevel = 1): string[] {
        if (!worklogs || !worklogs.length || !tags || !tags.length) return [];

        const [firstTag, ...restTags] = tags;
        const worklogsByTagValue = this._groupBy(worklogs, firstTag);

        let aggregatedSummaries = [];
        for (const worklogGrouping of worklogsByTagValue) {
            const groupingTagValue = worklogGrouping.key || '(no value)';
            const workslogsInGroup = worklogGrouping.value;

            const groupedDurationInMinutes = this._getWorklogDurationSumInMinutes(workslogsInGroup);
            const groupedDurationString = this._getTotalHsMsString(groupedDurationInMinutes);

            const indentation = ' '.repeat((indentationLevel - 1) * 4);
            aggregatedSummaries.push(`${indentation}- [${firstTag}] ${groupingTagValue}: ${groupedDurationString}`);
            aggregatedSummaries = aggregatedSummaries.concat(...this._generateAggregationLines(workslogsInGroup, restTags, indentationLevel + 1));
        }

        return aggregatedSummaries;
    }

    _groupBy(worklogs: Worklog[], tag: string): Record<string, Worklog[]>[] {
        const groupKeys = [];
        const groupValuesByGroupKey = {};

        for (const worklog of worklogs) {
            const tagValue = worklog.getTagValue(tag);

            // using Array.indexOf instead of !!groupValuesByGroupKey[tagValue]
            // prevents weird issues like tags with values "length" or "toString", etc.
            if (groupKeys.indexOf(tagValue) === -1) {
                groupKeys.push(tagValue);
                groupValuesByGroupKey[tagValue] = [worklog];
            } else {
                groupValuesByGroupKey[tagValue].push(worklog);
            }
        }

        const keyValueGroups = [];
        for (const key of groupKeys) {
            keyValueGroups.push({ key, value: groupValuesByGroupKey[key] });
        }

        return keyValueGroups;
    }
}
