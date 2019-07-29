const assert = require('assert');
const sinon = require('sinon');
const JiraClient = require('app/outputs/JiraWorklog/JiraClient');

describe('JiraClient', () => {
    describe('constructor', () => {
        it('validates that the jiraBaseUrl parameter is present', async () => {
            await assert.rejects(async () => await new JiraClient(), /Required parameter: jiraBaseUrl\./);
        });

        it('validates that the jiraUsername parameter is present', async () => {
            await assert.rejects(async () => await new JiraClient('something'), /Required parameter: jiraUsername\./);
        });

        it('validates that the jiraPassword parameter is present', async () => {
            await assert.rejects(async () => await new JiraClient('something', 'something'), /Required parameter: jiraPassword\./);
        });

        it('can be instantiated', () => {
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    describe('#saveWorklog', () => {
        it('validates that it receives a ticketId parameter', async () => {
            const jiraClient = getTestSubject();
            await assert.rejects(async () => await jiraClient.saveWorklog(), /Required parameter: ticketId\./);
        });

        async function assertRequiresWorklogParameter(worklog) {
            const jiraClient = getTestSubject();
            await assert.rejects(async () => await jiraClient.saveWorklog('PID-123', worklog), /Required parameter: worklog\./);
        }

        it('validates that it receives a worklog', async () => {
            await assertRequiresWorklogParameter(undefined);
            await assertRequiresWorklogParameter(null);
        });

        it('requires that the worklog parameter has a comment field', async () => {
            const jiraClient = getTestSubject();
            await assert.rejects(async () => await jiraClient.saveWorklog('PID-123', {}), /Worklog requires comment field\./);
        });

        it('requires that the worklog parameter has a started field', async () => {
            const jiraClient = getTestSubject();
            await assert.rejects(async () => await jiraClient.saveWorklog('PID-123', { comment: '123' }), /Worklog requires started field\./);
        });

        it('requires that the worklog parameter has a timeSpent field', async () => {
            const jiraClient = getTestSubject();
            await assert.rejects(async () => await jiraClient.saveWorklog('PID-123', { comment: '123', started: '2017-01-01T01:01:01.0000Z'}), /Worklog requires timeSpent field\./);
        });

        it('returns a promise', () => {
            const jiraClient = getTestSubject();
            const jiraWorklog = { comment: 'Some work.', started: '2017-01-01T01:01:01.0000Z', timeSpent: '1h' };

            const result = jiraClient.saveWorklog('PID-123', jiraWorklog);

            assert(result instanceof Promise);
        });

        it('returns a resolved promise if the server responded with a non-successful code', async () => {
            const jiraClient = getTestSubject({ status: 404, statusText: 'Not found.' });
            const jiraWorklog = { comment: 'Some work.', started: '2017-01-01T01:01:01.0000Z', timeSpent: '1h' };

            await jiraClient.saveWorklog('PID-123', jiraWorklog);
        });

        it('returns a resolved promise if the fetch parameter throws an exception (e.g. network)', async () => {
            const jiraClient = getTestSubject({ shouldResolve: false });
            const jiraWorklog = { comment: 'Some work.', started: '2017-01-01T01:01:01.0000Z', timeSpent: '1h' };

            await jiraClient.saveWorklog('PID-123', jiraWorklog);
        });

        it('calls the JIRA API with the right parameters', async () => {
            const fakeFetch = getFakeFetch();
            const fetchSpy = sinon.spy(fakeFetch);
            const jiraClient = getTestSubject({
                baseUrl: 'https://myjira.example.com',
                username: 'myTestUsername',
                password: 'myTestPassword',
                fetch: fetchSpy
            });
            const jiraWorklog = { comment: 'Some work.', started: '2017-01-01T01:01:01.0000Z', timeSpent: '1h' };

            await jiraClient.saveWorklog('MID-123', jiraWorklog);
            assert(fetchSpy.calledOnce);
            const firstArgument = fetchSpy.getCall(0).args[0];
            const secondArgument = fetchSpy.getCall(0).args[1];

            assert.equal(firstArgument, 'https://myjira.example.com/rest/api/2/issue/MID-123/worklog');
            assert.equal(secondArgument.headers['Authorization'], 'Basic bXlUZXN0VXNlcm5hbWU6bXlUZXN0UGFzc3dvcmQ=');
            assert.equal(secondArgument.headers['Content-Type'], 'application/json');
            assert.equal(secondArgument.method, 'POST');
            assert.deepEqual(JSON.parse(secondArgument.body), jiraWorklog);
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

function getFakeFetch({
    status = 201,
    statusText = 'Created.',
    shouldResolve = true,
} = {}) {
    return async function fakeFetch() {
        return await ({
            json: function fakeJson() {
                if (shouldResolve)
                    return await ({ status, statusText });

                throw new Error({ status, statusText });
            }
        });
    };
}
