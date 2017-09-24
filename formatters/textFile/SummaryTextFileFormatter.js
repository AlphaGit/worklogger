const WorklogSet = require('model/WorklogSet');
const logger = require('services/logger');

module.exports = class SummaryTextFileFormatter {
    formatWorklogs(worklogSet) {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        const startDateTime = worklogSet.startDateTime.toISOString();
        const endDateTime = worklogSet.endDateTime.toISOString();

        const totalDurationMinutes = worklogSet.worklogs
            .map(w => w.duration)
            .reduce((d1, d2) => d1 + d2, 0);

        const totalDurationString = this._getTotalHsMsString(totalDurationMinutes);

        const output =
`Worklogs from ${startDateTime} to ${endDateTime}:

Total time: ${totalDurationString}`;

        logger.trace('SummaryTextFileFormatter output: ', output);
        return output;
    }

    _getTotalHsMsString(totalDurationMinutes) {
        const totalHours = Math.floor(totalDurationMinutes / 60);
        const minutes = totalDurationMinutes % 60;

        return `${totalHours}hs ${minutes}m`;
    }
};
