const assert = require('assert');
const sinon = require('sinon');

const JiraWorklogOutput = require('outputs/JiraWorklog/Output');
const FormatterBase = require('formatters/FormatterBase');
const WorklogSet = require('models/WorklogSet');
const Worklog = require('models/Worklog');

describe('JiraWorklog output', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    describe('#outputWorklogSet', () => {
        it('instantiates a JIRA client with the right parameters', () => {
            const constructorStub = sinon.stub().returns();
            const fakeJiraClientClass = getFakeJiraClientClass({
                constructorStub
            });

            const output = getTestSubject({
                fakeJiraClientClass,
                JiraUrl: "https://myjira.example.com",
                JiraUsername: "jiraUserName@example.com",
                JiraPassword: "qwerty12356"
            });

            assert(constructorStub.called);
            const callArguments = constructorStub.getCall(0).args[0];
            assert.equal(callArguments.baseUrl, "https://myjira.example.com");
            assert.equal(callArguments.userName, "jiraUserName@example.com");
            assert.equal(callArguments.password, "qwerty12356");
        });

        it('saves each of the worklogs as JIRA worklogs', (done) => {
            const saveWorklogStub = sinon.stub().returns(Promise.resolve());
            const fakeJiraClientClass = getFakeJiraClientClass({
                saveWorklogStub: saveWorklogStub
            });
            const output = getTestSubject({
                fakeJiraClientClass
            });

            const worklogCount = 5;
            const startingAt = new Date('2017-01-01T07:00-0500');
            const worklogSet = getTestWorklogSet({ worklogCount, startingAt, durationInMinutes: 30 });
            worklogSet.worklogs.forEach(w => {
                w.addTag('JiraTicket', 'PID-123');
            });

            // worklog times are:
            // 1. 2017-01-01T07:00-0400 to 2017-01-01T07:30-0400
            // 2. 2017-01-01T07:30-0400 to 2017-01-01T08:00-0400
            // 3. 2017-01-01T08:00-0400 to 2017-01-01T08:30-0400
            // 4. 2017-01-01T08:30-0400 to 2017-01-01T09:00-0400
            // 5. 2017-01-01T09:00-0400 to 2017-01-01T09:30-0400

            output.outputWorklogSet(worklogSet).then(() => {
                assert.equal(saveWorklogStub.callCount, worklogSet.worklogs.length);

                for (let i = 0; i < worklogCount; i++) {
                    const saveWorklogStubArguments = saveWorklogStub.getCall(i).args;
                    const [ ticketIdArgument, jiraWorklogArgument ] = saveWorklogStubArguments;
                    const worklog = worklogSet.worklogs[i];

                    assert.equal(ticketIdArgument, 'PID-123');
                    assert.equal(jiraWorklogArgument.comment, worklog.name);
                    let hour = Math.floor(7 + i / 2);
                    if (hour < 10) hour = `0${hour}`;
                    const minutes = i % 2 == 0 ? '00' : '30';
                    assert.equal(jiraWorklogArgument.started, `2017-01-01T${hour}:${minutes}:00.000-0500`);
                    assert.equal(jiraWorklogArgument.timeSpent, '30m');
                }
            }).then(done)
            .catch(done);
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
    fakeJiraClientClass = getFakeJiraClientClass(),
    JiraUrl = "https://example.com",
    JiraUsername = "username",
    JiraPassword = "password"
} = {}) {
    const formatterConfiguration = {};
    const formatter = new FormatterBase(formatterConfiguration);
    const outputConfiguration = { JiraUrl, JiraUsername, JiraPassword };
    return new JiraWorklogOutput(formatter, outputConfiguration, { JiraClient: fakeJiraClientClass });
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