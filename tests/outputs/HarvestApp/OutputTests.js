const assert = require('assert');
const sinon = require('sinon');

const HarvestAppOutput = require('app/outputs/HarvestApp/Output');
const FormatterBase = require('app/formatters/FormatterBase');
const WorklogSet = require('app/models/WorklogSet');
const Worklog = require('app/models/Worklog');

const moment = require('moment-timezone');

describe('HarvestApp output', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    describe('#outputWorklogSet', () => {
        it('gets the list of available projects and tasks', async () => {
            const getProjectsAndTasksStub = sinon.stub().returns(Promise.resolve());
            const fakeHarvestClientClass = getFakeHarvestClientClass({ getProjectsAndTasksStub });
            const output = getTestSubject({ fakeHarvestClientClass });

            await output.outputWorklogSet(getTestWorklogSet());
            assert(getProjectsAndTasksStub.calledOnce);
        });

        it('saves each of the worklogs as time entries', async () => {
            const saveNewTimeEntryStub = sinon.stub().returns(Promise.resolve());
            const getProjectsAndTasksStub = sinon.stub().returns(await [{
                projectId: 1,
                projectName: 'Project 1',
                tasks: [{
                    taskId: 2,
                    taskName: 'Task 2'
                }]
            }]);
            const fakeHarvestClientClass = getFakeHarvestClientClass({
                getProjectsAndTasksStub: getProjectsAndTasksStub,
                saveNewTimeEntryStub: saveNewTimeEntryStub
            });
            const output = getTestSubject({
                fakeHarvestClientClass,
                projectTag: 'Project',
                taskTag: 'Task'
            });

            const worklogCount = 5;
            const startingAt = moment.tz('2017-01-01T07:00-0500', 'America/Toronto');
            const worklogSet = getTestWorklogSet({ worklogCount, startingAt: startingAt, durationInMinutes: 30 });
            worklogSet.worklogs.forEach(w => {
                w.addTag('Project', 'Project 1');
                w.addTag('Task', 'Task 2');
            });

            await output.outputWorklogSet(worklogSet);
            assert.strictEqual(saveNewTimeEntryStub.callCount, worklogSet.worklogs.length);

            for (let i = 0; i < worklogCount; i++) {
                const timeEntryArgument = saveNewTimeEntryStub.getCall(i).args[0];

                assert.strictEqual(timeEntryArgument.project_id, 1);
                assert.strictEqual(timeEntryArgument.task_id, 2);
                
                const expectedStartingAt = startingAt.clone().add(30 * i, 'minutes');
                assert.strictEqual(timeEntryArgument.spent_date, expectedStartingAt.format('YYYY-MM-DD'));
                assert.strictEqual(timeEntryArgument.started_time, expectedStartingAt.format('hh:mma'));
                assert.strictEqual(timeEntryArgument.ended_time, expectedStartingAt.clone().add(30, 'minutes').format('hh:mma'));
                assert.strictEqual(timeEntryArgument.hours, 0.5);
                assert.strictEqual(timeEntryArgument.notes, `Worklog ${i+1}`);
            }
        });

        it('ignores worklogs without matching Harvest project or task', async () => {
            const saveNewTimeEntryStub = sinon.stub().returns(Promise.resolve());
            const getProjectsAndTasksStub = sinon.stub().returns(await [{
                projectId: 1,
                projectName: 'Project 1',
                tasks: [{
                    taskId: 2,
                    taskName: 'Task 2'
                }]
            }]);
            const fakeHarvestClientClass = getFakeHarvestClientClass({
                getProjectsAndTasksStub: getProjectsAndTasksStub,
                saveNewTimeEntryStub: saveNewTimeEntryStub
            });
            const output = getTestSubject({
                fakeHarvestClientClass,
                projectTag: 'Project',
                taskTag: 'Task'
            });

            const worklogCount = 5;
            const startingAt = moment.tz('2017-01-01T07:00-0500', 'America/Toronto');
            const worklogSet = getTestWorklogSet({ worklogCount, startingAt: startingAt, durationInMinutes: 30 });
            worklogSet.worklogs.forEach(w => {
                w.addTag('Project', 'Project 1');
                w.addTag('Task', 'Task 2');
            });
            worklogSet.worklogs[0].addTag('Project', 'Unexistent project');
            worklogSet.worklogs[1].addTag('Task', 'Unexistent task');

            await output.outputWorklogSet(worklogSet);
            assert.equal(saveNewTimeEntryStub.callCount, worklogCount - 2);
        });
    });
});

function getTestWorklogSet({
    worklogCount = 0,
    startingAt = moment.tz('2017-01-01T17:00-0400', 'America/Toronto'),
    durationInMinutes = 30
} = {}) {
    const worklogs = [];
    for (let i = 0; i < worklogCount; i++) 
    {
        const startingAtIteration = startingAt.clone().add(durationInMinutes * i, 'minutes')
        const endingAtIteration = startingAtIteration.clone().add(durationInMinutes, 'minutes');
        const worklog = new Worklog(`Worklog ${i+1}`, startingAtIteration.toDate(), endingAtIteration.toDate());
        worklogs.push(worklog);
    }
    return new WorklogSet(new Date(), new Date(), worklogs);
}

function getTestSubject({
    fakeHarvestClientClass = getFakeHarvestClientClass(),
    projectTag = 'HarvestProjectTag',
    taskTag = 'HarvestTaskTag'
} = {}) {
    const formatterConfiguration = {};
    const appConfiguration = { options: { timeZone: 'America/Toronto' } };
    const formatter = new FormatterBase(formatterConfiguration, appConfiguration);
    const outputConfiguration = {
        selectProjectFromTag: projectTag,
        selectTaskFromTag: taskTag
    };
    return new HarvestAppOutput(formatter, outputConfiguration, appConfiguration, { HarvestClient: fakeHarvestClientClass });
}

function getFakeHarvestClientClass({
    getProjectsAndTasksStub = () => Promise.resolve(), 
    saveNewTimeEntryStub = () => Promise.resolve()
} = {}) {
    return class FakeHarvestClient {
        getProjectsAndTasks() {
            return getProjectsAndTasksStub();
        }

        saveNewTimeEntry(timeEntry) {
            return saveNewTimeEntryStub(timeEntry);
        }
    };
}