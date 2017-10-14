const assert = require('assert');
const sinon = require('sinon');

const HarvestAppOutput = require('outputs/HarvestApp/Output');
const FormatterBase = require('formatters/FormatterBase');
const WorklogSet = require('models/WorklogSet');

describe('HarvestApp output', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    describe('#outputWorklogSet', () => {
        it('gets the list of available projects and tasks', (done) => {
            const getProjectsAndTasksStub = sinon.stub().returns(Promise.resolve());
            const fakeHarvestClientClass = getFakeHarvestClientClass({ getProjectsAndTasksStub });
            const output = getTestSubject({ fakeHarvestClientClass });

            output.outputWorklogSet(getTestWorklogSet()).then(() => {
                assert(getProjectsAndTasksStub.calledOnce);
            }).then(done)
            .catch(done);
        });
    });
});

function getTestWorklogSet() {
    return new WorklogSet(new Date(), new Date(), []);
}

function getTestSubject({
    fakeHarvestClientClass = getFakeHarvestClientClass()
} = {}) {
    const formatterConfiguration = {};
    const formatter = new FormatterBase(formatterConfiguration);
    const outputConfiguration = {};
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

        saveNewTimeEntry() {
            return saveNewTimeEntryStub();
        }
    };
}