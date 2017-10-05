const WorklogSet = require('models/WorklogSet');
const logger = require('services/logger');

module.exports = class SummaryTextFileFormatter {
    constructor(formatterConfiguration) {
        if (!formatterConfiguration) throw new Error('Formatter configuration object is required.');
        this._configuration = formatterConfiguration;
    }

    format(worklogSet) {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        const startDateTime = worklogSet.startDateTime.toISOString();
        const endDateTime = worklogSet.endDateTime.toISOString();

        const aggregations = this._generateAggregations(worklogSet);

        const totalDurationMinutes = this._getWorklogDurationSumInMinutes(worklogSet.worklogs);

        const totalDurationString = this._getTotalHsMsString(totalDurationMinutes);

        const output =
`Worklogs from ${startDateTime} to ${endDateTime}:
${aggregations}
Total time: ${totalDurationString}`;

        logger.debug('SummaryTextFileFormatter output: ', output);
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
                const aggregation = this._generateAggregation(worklogSet.worklogs, tags);
                return `Total time by ${tags.join(' / ')}:\n\n${aggregation}`;
            })
            .join('\n');
    }

    _generateAggregation(worklogs, tags, indentationLevel = 1) {
        if (!worklogs || !worklogs.length || !tags || !tags.length) return '';

        const [firstTag, ...restTags] = tags;
        let worklogsByTag = this._groupBy(worklogs, firstTag);

        let aggregatedSummaries = '';
        for (let worklogGrouping of worklogsByTag) {
            const groupingTagValue = worklogGrouping.key;
            const groupedWorklogs = worklogGrouping.value;

            const groupedDurationInMinutes = this._getWorklogDurationSumInMinutes(groupedWorklogs);
            const groupedDurationString = this._getTotalHsMsString(groupedDurationInMinutes);

            const indentation = ' '.repeat((indentationLevel - 1) * 4);
            aggregatedSummaries += `${indentation}- Total time for ${groupingTagValue}: ${groupedDurationString}\n`;
            aggregatedSummaries += this._generateAggregation(groupedWorklogs, restTags, indentationLevel + 1);
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
