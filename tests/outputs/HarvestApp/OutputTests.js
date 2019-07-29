const assert = require('assert');
const sinon = require('sinon');

const HarvestAppOutput = require('app/outputs/HarvestApp/Output');
const FormatterBase = require('app/formatters/FormatterBase');
const WorklogSet = require('app/models/WorklogSet');
const Worklog = require('app/models/Worklog');

const moment = require('moment');

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
            const startingAt = moment('2017-01-01T07:00-0500');
            const worklogSet = getTestWorklogSet({ worklogCount, startingAt: startingAt.toDate(), durationInMinutes: 30 });
            worklogSet.worklogs.forEach(w => {
                w.addTag('Project', 'Project 1');
                w.addTag('Task', 'Task 2');
            });

            // worklog times are:
            // 1. 2017-01-01T07:00-0500 to 2017-01-01T07:30-0500
            // 2. 2017-01-01T07:30-0500 to 2017-01-01T08:00-0500
            // 3. 2017-01-01T08:00-0500 to 2017-01-01T08:30-0500
            // 4. 2017-01-01T08:30-0500 to 2017-01-01T09:00-0500
            // 5. 2017-01-01T09:00-0500 to 2017-01-01T09:30-0500

            await output.outputWorklogSet(worklogSet);
            assert.equal(saveNewTimeEntryStub.callCount, worklogSet.worklogs.length);

            for (let i = 0; i < worklogCount; i++) {
                const timeEntryArgument = saveNewTimeEntryStub.getCall(i).args[0];

                assert.equal(timeEntryArgument.project_id, 1);
                assert.equal(timeEntryArgument.task_id, 2);
                
                if (i > 0) startingAt.add(30, 'minutes');
                assert.equal(timeEntryArgument.spent_date, startingAt.format('YYYY-MM-DD'));
                assert.equal(timeEntryArgument.timer_started_at, startingAt.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'));
                assert.equal(timeEntryArgument.hours, 0.5);
                assert.equal(timeEntryArgument.notes, `Worklog ${i+1}`);
            }
        });
    });
});

function getTestWorklogSet({
    worklogCount = 0,
    startingAt = new Date('2017-01-01T17:00-0400'),
    durationInMinutes = 30
} = {}) {
    const worklogs = [];
    for (let i = 0; i < worklogCount; i++) 
    {
        const endingAt = new Date(+startingAt + durationInMinutes * 60 * 1000);
        const worklog = new Worklog(`Worklog ${i+1}`, startingAt, endingAt);
        worklogs.push(worklog);
        startingAt = endingAt;
    }
    return new WorklogSet(new Date(), new Date(), worklogs);
}

function getTestSubject({
    fakeHarvestClientClass = getFakeHarvestClientClass(),
    projectTag = 'HarvestProjectTag',
    taskTag = 'HarvestTaskTag'
} = {}) {
    const formatterConfiguration = {};
    const formatter = new FormatterBase(formatterConfiguration);
    const outputConfiguration = {
        selectProjectFromTag: projectTag,
        selectTaskFromTag: taskTag
    };
    return new HarvestAppOutput(formatter, outputConfiguration, { HarvestClient: fakeHarvestClientClass });
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