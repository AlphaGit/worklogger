module.exports = class WorklogSet {
    constructor(startDateTime, endDateTime, worklogs) {
        if (!(startDateTime instanceof Date)) throw new Error('Missing date parameter: startDateTime');
        if (!(endDateTime instanceof Date)) throw new Error('Missing date parameter: endDateTime');
        if (!Array.isArray(worklogs)) throw new Error('Missing array parameter: worklogs');

        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.worklogs = worklogs;
    }

    getFilteredCopy(filterFn) {
        const filteredWorklogs = this.worklogs.filter(filterFn);
        return new WorklogSet(this.startDateTime, this.endDateTime, filteredWorklogs);
    }
};