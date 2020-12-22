import { FormatterBase } from 'app/formatters/FormatterBase';
import { WorklogSet } from 'app/models/WorklogSet';
import { LoggerFactory } from 'app/services/loggerFactory';

const logger = LoggerFactory.getLogger('SummaryTextFormatter');

export class SummaryTextFormatter extends FormatterBase {
    private configuration: any;

    constructor(formatterConfiguration, appConfiguration) {
        super(formatterConfiguration, appConfiguration);
    }

    public format(worklogSet) {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        const startDateTime = worklogSet.startDateTime.toISOString();
        const endDateTime = worklogSet.endDateTime.toISOString();

        const aggregations = this.generateAggregations(worklogSet);

        const totalDurationMinutes = this.getWorklogDurationSumInMinutes(worklogSet.worklogs);

        const totalDurationString = this.getTotalHsMsString(totalDurationMinutes);

        let outputLines = [];
        outputLines.push(`Worklogs from ${startDateTime} to ${endDateTime}.`);
        outputLines.push('');

        if (aggregations.length) {
            outputLines = outputLines.concat(...aggregations);
        }

        outputLines.push(`Total time: ${totalDurationString}`);

        const output = outputLines.join('\n');
        logger.debug('SummaryTextFormatter output:', output);
        return output;
    }

    private getWorklogDurationSumInMinutes(worklogs) {
        return worklogs
            .map(w => w.duration)
            .reduce((d1, d2) => d1 + d2, 0);
    }

    private getTotalHsMsString(totalDurationMinutes) {
        const totalHours = Math.floor(totalDurationMinutes / 60);
        const minutes = totalDurationMinutes % 60;

        return `${totalHours}hs ${minutes}m`;
    }

    private generateAggregations(worklogSet) {
        if (!this.configuration.aggregateByTags) return [];

        return this.configuration.aggregateByTags
            .map(tags => {
                const aggregationLines = this.generateAggregationLines(worklogSet.worklogs, tags);
                return [
                    `Total time by ${tags.join(' / ')}:`,
                    '',
                    ...aggregationLines,
                    '',
                ];
            });
    }

    private generateAggregationLines(worklogs, tags, indentationLevel = 1) {
        if (!worklogs || !worklogs.length || !tags || !tags.length) return [];

        const [firstTag, ...restTags] = tags;
        let worklogsByTagValue = this.groupBy(worklogs, firstTag);

        let aggregatedSummaries = [];
        for (let worklogGrouping of worklogsByTagValue) {
            const groupingTagValue = worklogGrouping.key || '(no value)';
            const workslogsInGroup = worklogGrouping.value;

            const groupedDurationInMinutes = this.getWorklogDurationSumInMinutes(workslogsInGroup);
            const groupedDurationString = this.getTotalHsMsString(groupedDurationInMinutes);

            const indentation = ' '.repeat((indentationLevel - 1) * 4);
            aggregatedSummaries.push(`${indentation}- [${firstTag}] ${groupingTagValue}: ${groupedDurationString}`);

            const newIndentationLevel = indentationLevel + 1;
            aggregatedSummaries = aggregatedSummaries.concat(
                ...this.generateAggregationLines(workslogsInGroup, restTags, newIndentationLevel));
        }

        return aggregatedSummaries;
    }

    private groupBy(worklogs, tag) {
        const groupKeys = [];
        const groupValuesByGroupKey = {};

        for (let worklog of worklogs) {
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
        for (let key of groupKeys) {
            keyValueGroups.push({ key, value: groupValuesByGroupKey[key] });
        }

        return keyValueGroups;
    }
};
