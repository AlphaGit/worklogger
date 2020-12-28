import { Worklog } from "./Worklog";

type FilterFunction = (worklog: Worklog) => boolean;

export class WorklogSet {
    public startDateTime: Date;
    public endDateTime: Date;
    public worklogs: Worklog[];

    constructor(startDateTime: Date, endDateTime: Date, worklogs: Worklog[]) {
        if (!(startDateTime instanceof Date)) throw new Error('Missing date parameter: startDateTime');
        if (!(endDateTime instanceof Date)) throw new Error('Missing date parameter: endDateTime');
        if (!Array.isArray(worklogs)) throw new Error('Missing array parameter: worklogs');

        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.worklogs = worklogs;
    }

    getFilteredCopy(filterFn: FilterFunction): WorklogSet {
        const filteredWorklogs = this.worklogs.filter(filterFn);
        return new WorklogSet(this.startDateTime, this.endDateTime, filteredWorklogs);
    }

    toString(): string {
        return `${this.startDateTime.toISOString()} - ${this.endDateTime.toISOString()}`;
    }
}