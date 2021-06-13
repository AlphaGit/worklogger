import * as moment from 'moment-timezone';
import { FormatterBase } from '../app/formatters/FormatterBase';
import { FormatterConfigurationBase } from '../app/formatters/FormatterConfigurationBase';

import { AppConfiguration, AppConfigurationOptions, ServiceRegistrations as Services, Tag, Worklog, WorklogSet } from '../app/models';

export const Dates = {
    today: (): Date => moment().startOf('day').toDate(),
    pastTwoHours: (): Date => moment().subtract(2, 'hours').toDate(),
    pastOneHour: (): Date => moment().subtract(1, 'hour').toDate(),
    now: (): Date => moment().toDate(),
    tomorrow: (): Date => moment().add(1, 'day').startOf('day').toDate()
};

export const Tags = {
    client: {
        ProCorp: (): Tag => new Tag('client', 'ProCorp')
    },
    project: {
        TestPlatform: (): Tag => new Tag('project', 'Test Platform'),
        ResearchAndDevelopment: (): Tag => new Tag('project', 'R&D')
    }
}

const normalWorklog = (): Worklog => {
    const worklog = new Worklog('Planning meeting', Dates.pastOneHour(), Dates.now());
    worklog.addTag(Tags.client.ProCorp());
    worklog.addTag(Tags.project.TestPlatform());
    return worklog;
};

const normalWorklog2 = (): Worklog => {
    const worklog = new Worklog('Investigating technologies', Dates.pastTwoHours(), Dates.pastOneHour());
    worklog.addTag(Tags.client.ProCorp());
    worklog.addTag(Tags.project.ResearchAndDevelopment());
    return worklog;
}

const noTagsWorklog = (): Worklog => new Worklog('Meeting', Dates.pastOneHour(), Dates.now());

const noDurationWorklog = (): Worklog => {
    const worklog = new Worklog('Checkpoint', Dates.pastOneHour(), Dates.pastOneHour());
    worklog.addTag(Tags.client.ProCorp());
    worklog.addTag(Tags.project.TestPlatform());
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
    configuration.options.timeZone = 'America/Vancouver';
    configuration.options.minimumLoggableTimeSlotInMinutes = 30;
    return configuration;
};

export const AppConfigurations = {
    normal: getNormalAppConfiguration
}

const getMockServiceRegistrations = (): Services => {
    const serviceRegistrations = new Services();
    serviceRegistrations.FileLoader = {
        loadJson: jest.fn()
    };
    return serviceRegistrations;
};

export const ServiceRegistrations = {
    mock: getMockServiceRegistrations
}

class FakeFormatter extends FormatterBase {
    protected _configuration: FormatterConfigurationBase;
    protected _appConfiguration: AppConfiguration;

    public formatFunction: (WorklogSet) => string =
        (worklogSet) => worklogSet.toString();

    format(worklogSet: WorklogSet): string {
        return this.formatFunction(worklogSet);
    }
}

class FakeFormatterConfiguration extends FormatterConfigurationBase { }

export const FormatterConfigurations = {
    fake: (): FormatterConfigurationBase => new FakeFormatterConfiguration()
}

export const Formatters = {
    fake: (): FakeFormatter => new FakeFormatter(FormatterConfigurations.fake(), AppConfigurations.normal())
}