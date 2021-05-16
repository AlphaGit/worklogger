import * as moment from 'moment-timezone';

import { Worklog } from "../app/models/Worklog";
import { WorklogSet } from '../app/models/WorklogSet';

export const Dates = {
    today: (): Date => moment().startOf('day').toDate(),
    pastOneHour: (): Date => moment().subtract(1, 'hour').toDate(),
    now: (): Date => moment().toDate(),
    tomorrow: (): Date => moment().add(1, 'day').startOf('day').toDate()
};

const normalWorklog = (): Worklog => {
    const worklog = new Worklog('Planning meeting', Dates.pastOneHour(), Dates.now(), 60);
    worklog.addTag('client', 'ProCorp');
    worklog.addTag('project', 'Test Platform');
    return worklog;
};

const noTagsWorklog = (): Worklog => new Worklog('Meeting', Dates.pastOneHour(), Dates.now(), 60);

const noDurationWorklog = (): Worklog => {
    const worklog = new Worklog('Checkpoint', Dates.pastOneHour(), Dates.pastOneHour(), 0);
    worklog.addTag('client', 'ProCorp');
    worklog.addTag('project', 'Test Platform');
    return worklog;
};

export const Worklogs = {
    normal: normalWorklog,
    noTags: noTagsWorklog,
    noDuration: noDurationWorklog
};

export const WorklogSets = {
    mixed: (): WorklogSet => new WorklogSet(Dates.today(), Dates.tomorrow(), [ Worklogs.normal(), Worklogs.noDuration(), Worklogs.noTags() ])
}