const WorklogSet = require('model/WorklogSet');

module.exports = class SummaryTextFileFormatter {
    formatWorklogs(worklogSet) {
        if (!(worklogSet instanceof WorklogSet)) throw new Error('Missing WorklogSet.');

        const startDateTime = worklogSet.startDateTime.toISOString();
        const endDateTime = worklogSet.endDateTime.toISOString();

        return `Worklogs from ${startDateTime} to ${endDateTime}:`;
    }
};
