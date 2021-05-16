import * as moment from 'moment-timezone';

import { Worklog } from "../app/models/Worklog";

export const Dates = {
    pastOneHour: (): Date => moment().subtract(1, 'hour').toDate(),
    now: (): Date => moment().toDate()
};

const normalWorklog = (): Worklog => {
    const normalWorklog = new Worklog('Planning meeting', Dates.pastOneHour(), Dates.now(), 60);
    normalWorklog.addTag('client', 'ProCorp');
    normalWorklog.addTag('project', 'Test Platform');
    return normalWorklog;
};

export const Worklogs = {
    normal: normalWorklog
};