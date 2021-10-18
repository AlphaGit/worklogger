import { HarvestAppOutput, HarvestTimeEntry } from ".";
import { IHarvestAppOutputConfiguration } from "./IHarvestAppOutputConfiguration";
import { AppConfigurations, Formatters, WorklogSets } from '../../../tests/entities';
import { Tag } from "../../models";
import { HarvestProjectAndTasks } from "../../services/HarvestClient";

import moment from "moment-timezone";

const getProjectsAndTasksMock = jest.fn();
const saveNewTimeEntryMock = jest.fn();
jest.mock('../../services/HarvestClient/HarvestClient', () => ({
    HarvestClient: () => ({
        getProjectsAndTasks: getProjectsAndTasksMock,
        saveNewTimeEntry: saveNewTimeEntryMock
    })
}));

const configuration: IHarvestAppOutputConfiguration = {
    selectProjectFromTag: 'HarvestProjectTag',
    selectTaskFromTag: 'HarvestTaskTag',
    accountId: 'account-123',
    condition: undefined,
    contactInformation: 'test@example.com',
    excludeFromNonProcessedWarning: false,
    formatter: null,
    token: 'token-123',
    type: 'HarvestApp'
};

describe('constructor', () => {
    test('requires a formatter', () => {
        expect(() => new HarvestAppOutput(null, configuration, AppConfigurations.normal())).toThrow('Formatter is required.');
        expect(() => new HarvestAppOutput(undefined, configuration, AppConfigurations.normal())).toThrow('Formatter is required.');
    });
});

describe('outputWorklogSet', () => {
    beforeEach(() => {
        getProjectsAndTasksMock.mockClear().mockResolvedValue([{
            projectId: 1,
            projectName: 'Test Platform',
            tasks: [{
                taskId: 2,
                taskName: 'R&D'
            }]
        }] as HarvestProjectAndTasks[]);
    });

    test('requires a present worklogSet', async () => {
        const output = new HarvestAppOutput(Formatters.fake(), configuration, AppConfigurations.normal());

        await expect(async () => output.outputWorklogSet(null)).rejects.toThrow('Required parameter: worklogSet.');
        await expect(async () => output.outputWorklogSet(undefined)).rejects.toThrow('Required parameter: worklogSet.');
    });

    test('outputs every worklog', async () => {
        const output = new HarvestAppOutput(Formatters.fake(), configuration, AppConfigurations.normal());
        const worklogSet = WorklogSets.mixed();
        worklogSet.worklogs.forEach(w => {
            w.addTag(new Tag('HarvestProjectTag', 'Test Platform'));
            w.addTag(new Tag('HarvestTaskTag', 'R&D'));
        });

        await output.outputWorklogSet(worklogSet);

        expect(saveNewTimeEntryMock).toHaveBeenCalledTimes(3);
        const timeEntries = saveNewTimeEntryMock.mock.calls.map(c => c[0]) as HarvestTimeEntry[];
        
        timeEntries.forEach((timeEntry, index) => {
            const worklog = worklogSet.worklogs[index];

            expect(timeEntry.ended_time).toBe(moment(worklog.endDateTime).format('hh:mma'));
            expect(timeEntry.hours).toBe(worklog.getDurationInMinutes() / 60);
            expect(timeEntry.notes).toBe(worklog.name);
            expect(timeEntry.project_id).toBe(1);
            expect(timeEntry.spent_date).toBe(moment(worklog.startDateTime).format('YYYY-MM-DD'));
            expect(timeEntry.started_time).toBe(moment(worklog.startDateTime).format('hh:mma'));
            expect(timeEntry.task_id).toBe(2);
            expect(timeEntry.is_running).toBe(false);
        });
    });

    test('ignores worklogs that don\' match projects', async () => {
        const output = new HarvestAppOutput(Formatters.fake(), configuration, AppConfigurations.normal());
        const worklogSet = WorklogSets.mixed();
        worklogSet.worklogs.forEach(w => {
            w.addTag(new Tag('HarvestProjectTag', 'Test Platform'));
            w.addTag(new Tag('HarvestTaskTag', 'R&D'));
        });
        worklogSet.worklogs[1].addTag(new Tag('HarvestProjectTag', 'Unexistent project'));
        worklogSet.worklogs[2].removeTag('HarvestProjectTag');

        await output.outputWorklogSet(worklogSet);

        expect(saveNewTimeEntryMock).toHaveBeenCalledTimes(1);
    });

    test('ignores worklogs that don\' match tasks', async () => {
        const output = new HarvestAppOutput(Formatters.fake(), configuration, AppConfigurations.normal());
        const worklogSet = WorklogSets.mixed();
        worklogSet.worklogs.forEach(w => {
            w.addTag(new Tag('HarvestProjectTag', 'Test Platform'));
            w.addTag(new Tag('HarvestTaskTag', 'R&D'));
        });
        worklogSet.worklogs[1].addTag(new Tag('HarvestTaskTag', 'Unexistent task'));
        worklogSet.worklogs[2].removeTag('HarvestTaskTag');

        await output.outputWorklogSet(worklogSet);

        expect(saveNewTimeEntryMock).toHaveBeenCalledTimes(1);
    });

    test('reads the project from the "HarvestProject" tag by default', async () => {
        const config = { ...configuration };
        delete config.selectProjectFromTag;

        const output = new HarvestAppOutput(Formatters.fake(), config, AppConfigurations.normal());
        const worklogSet = WorklogSets.single();
        worklogSet.worklogs.forEach(w => {
            w.addTag(new Tag('HarvestProject', 'Test Platform'));
            w.addTag(new Tag('HarvestTaskTag', 'R&D'));
        });

        await output.outputWorklogSet(worklogSet);

        expect(saveNewTimeEntryMock).toHaveBeenCalledTimes(1);
    });

    test('reads the task from the "HarvestTask" tag by default', async () => {
        const config = { ...configuration };
        delete config.selectTaskFromTag;

        const output = new HarvestAppOutput(Formatters.fake(), config, AppConfigurations.normal());
        const worklogSet = WorklogSets.single();
        worklogSet.worklogs.forEach(w => {
            w.addTag(new Tag('HarvestProjectTag', 'Test Platform'));
            w.addTag(new Tag('HarvestTask', 'R&D'));
        });

        await output.outputWorklogSet(worklogSet);

        expect(saveNewTimeEntryMock).toHaveBeenCalledTimes(1);
    });
});