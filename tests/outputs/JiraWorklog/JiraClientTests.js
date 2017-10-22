const assert = require('assert');
const sinon = require('sinon');
const JiraClient = require('outputs/JiraWorklog/JiraClient');

describe('JiraClient', () => {
    describe('constructor', () => {
        it('validates that the jiraBaseUrl parameter is present', () => {
            assert.throws(() => new JiraClient(), /Required parameter: jiraBaseUrl\./);
        });

        it('validates that the jiraUsername parameter is present', () => {
            assert.throws(() => new JiraClient('something'), /Required parameter: jiraUsername\./);
        });

        it('validates that the jiraPassword parameter is present', () => {
            assert.throws(() => new JiraClient('something', 'something'), /Required parameter: jiraPassword\./);
        });

        it('can be instantiated', () => {
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    describe('#saveWorklog', () => {
        it('validates that it receives a ticketId parameter', () => {
            const jiraClient = getTestSubject();
            assert.throws(() => jiraClient.saveWorklog(), /Required parameter: ticketId\./);
        });

        it('validates that it receives a worklog', () => {
            const jiraClient = getTestSubject();
            const assertWorklogParameter = (worklog) => assert.throws(() => jiraClient.saveWorklog('PID-123', worklog), /Required parameter: worklog\./);
            assertWorklogParameter(undefined);
            assertWorklogParameter(null);
        });

        it('requires that the worklog parameter has a comment field', () => {
            const jiraClient = getTestSubject();
            assert.throws(() => jiraClient.saveWorklog('PID-123', {}), /Worklog requires comment field\./);
        });

        it('requires that the worklog parameter has a started field', () => {
            const jiraClient = getTestSubject();
            assert.throws(() => jiraClient.saveWorklog('PID-123', { comment: '123' }), /Worklog requires started field\./);
        });

        it('requires taht the worklog parameter has a timeSpent field', () => {
            const jiraClient = getTestSubject();
            assert.throws(() => jiraClient.saveWorklog('PID-123', { comment: '123', started: '2017-01-01T01:01:01.0000Z'}), /Worklog requires timeSpent field\./);
        });

        it('returns a promise', () => {
            const jiraClient = getTestSubject();
            const jiraWorklog = { comment: 'Some work.', started: '2017-01-01T01:01:01.0000Z', timeSpent: '1h' };

            const result = jiraClient.saveWorklog('PID-123', jiraWorklog);

            assert(result instanceof Promise);
        });

        it('calls the JIRA API with the right parameters', (done) => {
            const fakeFetch = getFakeFetch();
            const fetchSpy = sinon.spy(fakeFetch);
            const jiraClient = getTestSubject({
                baseUrl: 'https://myjira.example.com',
                username: 'myTestUsername',
                password: 'myTestPassword',
                fetch: fetchSpy
            });
            const jiraWorklog = { comment: 'Some work.', started: '2017-01-01T01:01:01.0000Z', timeSpent: '1h' };

            jiraClient.saveWorklog('MID-123', jiraWorklog)
                .then(() => {
                    assert(fetchSpy.calledOnce);
                    const firstArgument = fetchSpy.getCall(0).args[0];
                    const secondArgument = fetchSpy.getCall(0).args[1];

                    assert.equal(firstArgument, 'https://myjira.example.com/rest/api/2/issue/MID-123/worklog');
                    assert.equal(secondArgument.headers['Authorization'], 'Basic bXlUZXN0VXNlcm5hbWU6bXlUZXN0UGFzc3dvcmQ=');
                    assert.equal(secondArgument.headers['Content-Type'], 'application/json');
                    assert.equal(secondArgument.method, 'POST');
                    assert.deepEqual(JSON.parse(secondArgument.body), jiraWorklog);
                })
                .then(done)
                .catch(done);
        });
    });
});

function getTestSubject({
    baseUrl = 'https://jira.example.com',
    username = 'myUsername',
    password = 'myPassword',
    fetch = getFakeFetch()
} = {}) {
    return new JiraClient(baseUrl, username, password, { fetch });
}

function getFakeFetch() {
    return function fakeFetch() {
        return Promise.resolve({
            json: function fakeJson() {
                return Promise.resolve();
            }
        });
    }
}
