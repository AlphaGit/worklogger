const WorklogSet = require('app/models/WorklogSet');
const FormatterBase = require('app/formatters/FormatterBase');
const logger = require('app/services/loggerFactory').getLogger('SummaryTextFileFormatter');

module.exports = class SummaryTextFileFormatter extends FormatterBase {
    constructor(formatterConfiguration) {
        super(formatterConfiguration);
    }

    format(worklogSet) {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        const startDateTime = worklogSet.startDateTime.toISOString();
        const endDateTime = worklogSet.endDateTime.toISOString();

        const aggregations = this._generateAggregations(worklogSet);

        const totalDurationMinutes = this._getWorklogDurationSumInMinutes(worklogSet.worklogs);

        const totalDurationString = this._getTotalHsMsString(totalDurationMinutes);

        let outputLines = [];
        outputLines.push(`Worklogs from ${startDateTime} to ${endDateTime}.`);
        outputLines.push('');

        if (aggregations.length) { 
            outputLines = outputLines.concat(...aggregations);
            outputLines.push('');
        }

        outputLines.push(`Total time: ${totalDurationString}`);

        const output = outputLines.join('\n');
        logger.debug('SummaryTextFileFormatter output:', output);
        return output;
    }

    _getWorklogDurationSumInMinutes(worklogs) {
        return worklogs
            .map(w => w.duration)
            .reduce((d1, d2) => d1 + d2, 0);
    }

    _getTotalHsMsString(totalDurationMinutes) {
        const totalHours = Math.floor(totalDurationMinutes / 60);
        const minutes = totalDurationMinutes % 60;

        return `${totalHours}hs ${minutes}m`;
    }

    _generateAggregations(worklogSet) {
        if (!this._configuration.aggregateByTags) return '';

        return this._configuration.aggregateByTags
            .map(tags => {
                const aggregationLines = this._generateAggregationLines(worklogSet.worklogs, tags);
                return [
                    `Total time by ${tags.join(' / ')}:`,
                    '',
                    ...aggregationLines
                ];
            });
    }

    _generateAggregationLines(worklogs, tags, indentationLevel = 1) {
        if (!worklogs || !worklogs.length || !tags || !tags.length) return [];

        const [firstTag, ...restTags] = tags;
        let worklogsByTagValue = this._groupBy(worklogs, firstTag);

        let aggregatedSummaries = [];
        for (let worklogGrouping of worklogsByTagValue) {
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

    _groupBy(worklogs, tag) {
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
