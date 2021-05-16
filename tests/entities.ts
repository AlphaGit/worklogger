import * as moment from 'moment-timezone';

import { AppConfiguration, AppConfigurationOptions } from '../app/models/AppConfiguration';
import { Worklog } from "../app/models/Worklog";
import { WorklogSet } from '../app/models/WorklogSet';

export const Dates = {
    today: (): Date => moment().startOf('day').toDate(),
    pastTwoHours: (): Date => moment().subtract(2, 'hours').toDate(),
    pastOneHour: (): Date => moment().subtract(1, 'hour').toDate(),
    now: (): Date => moment().toDate(),
    tomorrow: (): Date => moment().add(1, 'day').startOf('day').toDate()
};

const normalWorklog = (): Worklog => {
    const worklog = new Worklog('Planning meeting', Dates.pastOneHour(), Dates.now());
    worklog.addTag('client', 'ProCorp');
    worklog.addTag('project', 'Test Platform');
    return worklog;
};

const normalWorklog2 = (): Worklog => {
    const worklog = new Worklog('Investigating technologies', Dates.pastTwoHours(), Dates.pastOneHour());
    worklog.addTag('client', 'ProCorp');
    worklog.addTag('project', 'R&D');
    return worklog;
}

const noTagsWorklog = (): Worklog => new Worklog('Meeting', Dates.pastOneHour(), Dates.now());

const noDurationWorklog = (): Worklog => {
    const worklog = new Worklog('Checkpoint', Dates.pastOneHour(), Dates.pastOneHour());
    worklog.addTag('client', 'ProCorp');
    worklog.addTag('project', 'Test Platform');
    return worklog;
};

export const Worklogs = {
    normal: normalWorklog,
    normal2: normalWorklog2,
    noTags: noTagsWorklog,
    noDuration: noDurationWorklog
};

export const WorklogSets = {
    mixed: (): WorklogSet => new WorklogSet(Dates.today(), Dates.tomorrow(), [ Worklogs.normal(), Worklogs.noDuration(), Worklogs.noTags() ]),
    single: (): WorklogSet => new WorklogSet(Dates.today(), Dates.tomorrow(), [ Worklogs.normal() ]),
    singleNoTags: (): WorklogSet => new WorklogSet(Dates.today(), Dates.tomorrow(), [ Worklogs.noTags() ]),
    double: (): WorklogSet => new WorklogSet(Dates.today(), Dates.tomorrow(), [ Worklogs.normal(), Worklogs.normal2() ])
}

const getNormalAppConfiguration = (): AppConfiguration => {
    const configuration = new AppConfiguration();
    configuration.options = new AppConfigurationOptions();
    configuration.options.timeZone = 'America/Toronto';
    return configuration;
};

export const AppConfigurations = {
    normal: getNormalAppConfiguration
}