import { WorklogSet } from '../../models/WorklogSet';
import { FormatterBase } from '../FormatterBase';
import { Worklog } from '../../models/Worklog';
import { SummaryTextFormatterConfiguration } from './SummaryTextFormatterConfiguration';
import * as moment from 'moment-timezone';
import { getLogger, LoggerCategory } from '../../services/Logger';

const logger = getLogger(LoggerCategory.Formatters);

export class SummaryTextFormatter extends FormatterBase {
    async format(worklogSet: WorklogSet): Promise<string> {
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
        const totalHours = Math.floor(totalDurationMinutes / 60);
        const minutes = Math.floor(totalDurationMinutes % 60);

        return `${totalHours}hs ${minutes}m`;
    }

    _generateAggregations(worklogSet: WorklogSet): string[][] {
        const configuration = this._configuration as SummaryTextFormatterConfiguration;

        if (!configuration.aggregateByTags || !configuration.aggregateByTags.length) return [];

        return configuration.aggregateByTags
            .map(tags => {
                // Get worklogs that have at least one of the required tags
                const taggedWorklogs = worklogSet.worklogs.filter(w => 
                    tags.some(tag => w.getTagValue(tag) !== undefined)
                );
                
                // Calculate non-tagged time
                const nonTaggedWorklogs = worklogSet.worklogs.filter(w => 
                    tags.every(tag => w.getTagValue(tag) === undefined)
                );
                const nonTaggedDurationMinutes = this._getWorklogDurationSumInMinutes(nonTaggedWorklogs);
                const nonTaggedDurationString = this._getTotalHsMsString(nonTaggedDurationMinutes);

                const aggregationLines = this._generateAggregationLines(taggedWorklogs, tags);
                return [
                    `Total time by ${tags.join(' / ')}: (excluding non-tagged: ${nonTaggedDurationString})`,
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

        let aggregatedSummaries: string[] = [];
        for (const worklogGrouping of worklogsByTagValue) {
            // Skip entries with no key value
            if (!worklogGrouping.key) {
                continue;
            }
            
            const groupingTagValue = worklogGrouping.key;
            const workslogsInGroup = worklogGrouping.value;

            const groupedDurationInMinutes = this._getWorklogDurationSumInMinutes(workslogsInGroup);
            const groupedDurationString = this._getTotalHsMsString(groupedDurationInMinutes);

            const indentation = ' '.repeat((indentationLevel - 1) * 4);
            aggregatedSummaries.push(`${indentation}- [${firstTag}] ${groupingTagValue}: ${groupedDurationString}`);
            aggregatedSummaries = aggregatedSummaries.concat(...this._generateAggregationLines(workslogsInGroup, restTags, indentationLevel + 1));
        }

        return aggregatedSummaries;
    }

    _groupBy(worklogs: Worklog[], tag: string): { key: string, value: Worklog[] }[] {
        const groupKeys = [];
        const groupValuesByGroupKey: Record<string, Worklog[]> = {};

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

export default SummaryTextFormatter;