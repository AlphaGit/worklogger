const assert = require('assert');
const sinon = require('sinon');
const moment = require('moment-timezone');

const JiraWorklogOutput = require('app/outputs/JiraWorklog/Output');
const FormatterBase = require('app/formatters/FormatterBase');
const WorklogSet = require('app/models/WorklogSet');
const Worklog = require('app/models/Worklog');

describe('JiraWorklog output', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    describe('#constructor', () => {
        it('instantiates a JIRA client with the right parameters', () => {
            const constructorStub = sinon.stub().returns();
            const fakeJiraClientClass = getFakeJiraClientClass({
                constructorStub
            });

            getTestSubject({
                fakeJiraClientClass,
                JiraUrl: 'https://myjira.example.com',
                JiraUsername: 'jiraUserName@example.com',
                JiraPassword: 'qwerty12356'
            });

            assert(constructorStub.called);
            const callArguments = constructorStub.getCall(0).args[0];
            assert.equal(callArguments.baseUrl, 'https://myjira.example.com');
            assert.equal(callArguments.userName, 'jiraUserName@example.com');
            assert.equal(callArguments.password, 'qwerty12356');
        });
    });

    describe('#outputWorklogSet', () => {
        it('saves each of the worklogs as JIRA worklogs', async () => {
            const saveWorklogStub = sinon.stub().returns(Promise.resolve());
            const fakeJiraClientClass = getFakeJiraClientClass({
                saveWorklogStub: saveWorklogStub
            });
            const output = getTestSubject({
                fakeJiraClientClass
            });

            const worklogCount = 5;
            const startingAt = moment.tz('2017-01-01T07:00-0500', 'America/Toronto');
            const worklogSet = getTestWorklogSet({ worklogCount, startingAt, durationInMinutes: 30 });
            worklogSet.worklogs.forEach(w => {
                w.addTag('JiraTicket', 'PID-123');
            });

            await output.outputWorklogSet(worklogSet);
            assert.strictEqual(saveWorklogStub.callCount, worklogSet.worklogs.length);

            for (let i = 0; i < worklogCount; i++) {
                const saveWorklogStubArguments = saveWorklogStub.getCall(i).args;
                const [ ticketIdArgument, jiraWorklogArgument ] = saveWorklogStubArguments;
                const worklog = worklogSet.worklogs[i];

                assert.strictEqual(ticketIdArgument, 'PID-123');
                assert.strictEqual(jiraWorklogArgument.comment, worklog.name);
                const expectedStartingAt = startingAt.clone().add(30 * i, 'minutes');
                assert.strictEqual(jiraWorklogArgument.started, expectedStartingAt.utc().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'));
                assert.strictEqual(jiraWorklogArgument.timeSpent, '30m');

                
            }
        });

        it('only saves worklogs that have a JiraTicket tag value', async () => {
            const saveWorklogStub = sinon.stub().returns(Promise.resolve());
            const fakeJiraClientClass = getFakeJiraClientClass({
                saveWorklogStub: saveWorklogStub
            });
            const output = getTestSubject({
                fakeJiraClientClass
            });

            const worklogCount = 2;
            const startingAt = moment.tz('2017-01-01T07:00-0500', 'America/Toronto');
            const worklogSet = getTestWorklogSet({ worklogCount, startingAt, durationInMinutes: 30 });
            // worklogSet.worklogs[0]: no JiraTicket tag
            worklogSet.worklogs[1].addTag('JiraTicket', '');

            await output.outputWorklogSet(worklogSet);
            assert.equal(saveWorklogStub.callCount, 0);
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
        const endingAt = startingAt.clone().add(durationInMinutes, 'minutes');
        const worklog = new Worklog(`Worklog ${i+1}`, startingAt.toDate(), endingAt.toDate());
        worklogs.push(worklog);
        startingAt = endingAt;
    }
    return new WorklogSet(new Date(), new Date(), worklogs);
}

function getTestSubject({
    fakeJiraClientClass = getFakeJiraClientClass(),
    JiraUrl = 'https://example.com',
    JiraUsername = 'username',
    JiraPassword = 'password'
} = {}) {
    const formatterConfiguration = {};
    const appConfiguration = { options: { timeZone: 'America/Toronto' } };
    const formatter = new FormatterBase(formatterConfiguration, appConfiguration);
    const outputConfiguration = { JiraUrl, JiraUsername, JiraPassword };
    return new JiraWorklogOutput(formatter, outputConfiguration, appConfiguration, { JiraClient: fakeJiraClientClass });
}

function getFakeJiraClientClass({
    constructorStub = () => {},
    saveWorklogStub = () => Promise.resolve()
} = {}) {
    return class FakeJiraClient {
        constructor(baseUrl, userName, password) {
            const clientValues = { baseUrl, userName, password };
            constructorStub(clientValues);
        }

        saveWorklog(ticketId, worklog) {
            return saveWorklogStub(ticketId, worklog);
        }
    };
}