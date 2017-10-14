const assert = require('assert');
const sinon = require('sinon');
const HarvestClient = require('outputs/HarvestApp/HarvestClient');

describe('HarvestClient', () => {
    describe('#constructor', () => {
        it('requires a configuration object', () => {
            const assertMissingConfiguration = (action) => assert.throws(action, /Missing parameter: configuration\./);

            assertMissingConfiguration(() => new HarvestClient());
            assertMissingConfiguration(() => new HarvestClient(undefined));
            assertMissingConfiguration(() => new HarvestClient(null));
        });

        it('requires accountId in the configuration object', () => {
            const assertMissingAccountId = (action) => assert.throws(action, /Required configuration: accountId\./);

            assertMissingAccountId(() => new HarvestClient({}));
            assertMissingAccountId(() => new HarvestClient({ accountId: null }));
            assertMissingAccountId(() => new HarvestClient({ accountId: '' }));
        });

        it('requires a token in the configuration object', () => {
            const assertMissingToken = (action) => assert.throws(action, /Required configuration: token\./);

            assertMissingToken(() => new HarvestClient({ accountId: 123 }));
            assertMissingToken(() => new HarvestClient({ accountId: 123, token: null }));
            assertMissingToken(() => new HarvestClient({ accountId: 123, token: '' }));
        });

        it('requires contactInformation in the configuration object', () => {
            const assertMissingContactInformation = (action) => assert.throws(action, /Required configuration: contactInformation\./);

            assertMissingContactInformation(() => new HarvestClient({ accountId: 123, token: '123' }));
            assertMissingContactInformation(() => new HarvestClient({ accountId: 123, token: '123', contactInformation: undefined }));
            assertMissingContactInformation(() => new HarvestClient({ accountId: 123, token: '123', contactInformation: null }));
            assertMissingContactInformation(() => new HarvestClient({ accountId: 123, token: '123', contactInformation: '' }));
        });

        it('can be instantiated', () => {
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    describe('#getProjectsAndTasks', () => {
        it('returns a promise', () => {
            const harvestClient = getTestSubject();
            assert(harvestClient.getProjectsAndTasks() instanceof Promise);
        });

        it('makes a call to HarvestApi with the right values', (done) => {
            const fakeFetch = getFakeFetch();
            const fetchSpy = sinon.spy(fakeFetch);
            const harvestClient = getTestSubject({
                accountId: 12345,
                token: 'Auth123',
                contactInformation: 'contactInformation@example.com',
                fetch: fetchSpy
            });

            harvestClient.getProjectsAndTasks()
                .then(() => {
                    assert(fetchSpy.calledOnce);
                    const firstArgument = fetchSpy.getCall(0).args[0];
                    const secondArgument = fetchSpy.getCall(0).args[1];

                    assert.equal(firstArgument, 'https://api.harvestapp.com/api/v2/users/me/project_assignments.json');
                    assert.equal(secondArgument.headers['Authorization'], 'Bearer Auth123');
                    assert.equal(secondArgument.headers['Harvest-Account-Id'], '12345');
                    assert.equal(secondArgument.headers['User-Agent'], 'Worklogger (contactInformation@example.com)');
                })
                .then(done)
                .catch(done);
        });

        it('parses the response as json', (done) => {
            const jsonStub = sinon.stub().returns(Promise.resolve(getRealApiResponse()));
            const fetchStub = sinon.stub().returns(Promise.resolve({ json: jsonStub }));
            const harvestClient = getTestSubject({
                fetch: fetchStub
            });

            harvestClient.getProjectsAndTasks()
                .then(() => {
                    assert(fetchStub.calledOnce);
                    assert(jsonStub.calledOnce);
                })
                .then(done)
                .catch(done);
        });

        it('returns the project ids and names with task ids and names', (done) => {
            const apiResponse = getRealApiResponse();
            const jsonStub = sinon.stub().returns(Promise.resolve(apiResponse));
            const fetchStub = sinon.stub().returns(Promise.resolve({ json: jsonStub }));
            const harvestClient = getTestSubject({
                fetch: fetchStub
            });

            harvestClient.getProjectsAndTasks()
                .then((result) => {
                    assert.equal(result.length, 2);

                    assert.equal(result[0].projectId, 11);
                    assert.equal(result[0].projectName, 'Project A');
                    assert.equal(result[0].tasks.length, 2);
                    assert.equal(result[0].tasks[0].taskId, 111);
                    assert.equal(result[0].tasks[0].taskName, 'Task A');
                    assert.equal(result[0].tasks[1].taskId, 112);
                    assert.equal(result[0].tasks[1].taskName, 'Task B');

                    assert.equal(result[1].projectId, 22);
                    assert.equal(result[1].projectName, 'Project B');
                    assert.equal(result[1].tasks.length, 2);
                    assert.equal(result[1].tasks[0].taskId, 221);
                    assert.equal(result[1].tasks[0].taskName, 'Task A');
                    assert.equal(result[1].tasks[1].taskId, 222);
                    assert.equal(result[1].tasks[1].taskName, 'Task B');
                })
                .then(done)
                .catch(done);
        });
    });

    describe('#saveNewTimeEntry', () => {
        it('requires a timeEntry object', () => {
            const assertRequiredTimeEntry = (action) => assert.throws(action, /Required parameter: timeEntry\./)
            const harvestClient = getTestSubject();

            assertRequiredTimeEntry(() => harvestClient.saveNewTimeEntry());
            assertRequiredTimeEntry(() => harvestClient.saveNewTimeEntry(null));
            assertRequiredTimeEntry(() => harvestClient.saveNewTimeEntry(undefined));
        });

        it('requires that the time entry has a project_id', () => {
            const assertRequiredParameter = (action) => assert.throws(action, /Time entry needs to have project_id\./)
            const harvestClient = getTestSubject();

            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({}));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: undefined }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: null }));
        });

        it('requires that the time entry has a task_id', () => {
            const assertRequiredParameter = (action) => assert.throws(action, /Time entry needs to have task_id\./)
            const harvestClient = getTestSubject();

            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1 }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: undefined }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: null }));
        });

        it('requires that the time entry has a spent_date', () => {
            const assertRequiredParameter = (action) => assert.throws(action, /Time entry needs to have spent_date\./)
            const harvestClient = getTestSubject();

            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1 }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: undefined }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: null }));
        });

        it('requires that the time entry has a timer_started_at', () => {
            const assertRequiredParameter = (action) => assert.throws(action, /Time entry needs to have timer_started_at\./)
            const harvestClient = getTestSubject();

            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: '2017-01-01' }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: '2017-01-01', timer_started_at: undefined }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: '2017-01-01', timer_started_at: null }));
        });

        it('requires that the time entry has hours', () => {
            const assertRequiredParameter = (action) => assert.throws(action, /Time entry needs to have hours\./)
            const harvestClient = getTestSubject();

            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: '2017-01-01', timer_started_at: '2017-01-01T07:00-0400' }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: '2017-01-01', timer_started_at: '2017-01-01T07:00-0400', hours: null }));
            assertRequiredParameter(() => harvestClient.saveNewTimeEntry({ project_id: 1, task_id: 1, spent_date: '2017-01-01', timer_started_at: '2017-01-01T07:00-0400', hours: undefined }));
        });

        it('calls the HarvestApi with the right parameters', (done) => {
            const fakeFetch = getFakeFetch();
            const fetchSpy = sinon.spy(fakeFetch);
            const harvestClient = getTestSubject({
                accountId: 12345,
                token: 'Auth123',
                contactInformation: 'contactInformation@example.com',
                fetch: fetchSpy
            });

            const timeEntry = {
                project_id: 1,
                task_id: 12,
                spent_date: '2017-01-01',
                timer_started_at: '2017-01-01T07:00-0400',
                hours: 1.5,
                notes: 'Task description'
            };
            harvestClient.saveNewTimeEntry(timeEntry)
                .then(() => {
                    assert(fetchSpy.calledOnce);
                    const firstArgument = fetchSpy.getCall(0).args[0];
                    const secondArgument = fetchSpy.getCall(0).args[1];

                    assert.equal(firstArgument, 'https://api.harvestapp.com/api/v2/time_entries');
                    assert.equal(secondArgument.headers['Authorization'], 'Bearer Auth123');
                    assert.equal(secondArgument.headers['Harvest-Account-Id'], '12345');
                    assert.equal(secondArgument.headers['User-Agent'], 'Worklogger (contactInformation@example.com)');

                    assert.equal(secondArgument.method, 'POST');
                    assert.deepEqual(JSON.parse(secondArgument.body), timeEntry);
                })
                .then(done)
                .catch(done);

        });
    });
});

function getFakeFetch() {
    return function fakeFetch() {
        return Promise.resolve({
            json: function fakeJson() {
                return Promise.resolve(getRealApiResponse());
            }
        });
    }
}

function getTestSubject({
    accountId = 123,
    token = '123',
    contactInformation = 'contact@example.com',
    fetch = getFakeFetch()
} = {}) {
    return new HarvestClient({
        accountId,
        token,
        contactInformation
    }, { fetch });
}

function getRealApiResponse() {
    return {
        project_assignments: [{
            id: 123456,
            is_project_manager: false,
            is_active: true,
            budget: null,
            created_at: "2017-07-07T12:09:45Z",
            updated_at: "2017-07-07T12:09:45Z",
            hourly_rate: null,
            project: {
                id: 11,
                name: "Project A",
                code: ""
            },
            client: {
                id: 1,
                name: "Client A"
            },
            task_assignments: [{
                id: 123456,
                billable: true,
                is_active: true,
                created_at: "2017-10-05T19:57:47Z",
                updated_at: "2017-10-05T19:57:47Z",
                hourly_rate: null,
                budget: null,
                task: {
                    id: 111,
                    name: "Task A"
                }
            }, {
                id: 123456,
                billable: false,
                is_active: true,
                created_at: "2017-09-11T16:12:33Z",
                updated_at: "2017-09-11T16:12:33Z",
                hourly_rate: null,
                budget: null,
                task: {
                    id: 112,
                    name: "Task B"
                }
            }]
        },
        {
            id: 123456,
            is_project_manager: false,
            is_active: true,
            budget: null,
            created_at: "2017-06-05T20:02:50Z",
            updated_at: "2017-06-05T20:02:50Z",
            hourly_rate: null,
            project: {
                id: 22,
                name: "Project B",
                code: "COD"
            },
            client: {
                id: 2,
                name: "Client B"
            },
            task_assignments: [{
                id: 123456,
                billable: false,
                is_active: true,
                created_at: "2017-08-28T16:45:18Z",
                updated_at: "2017-08-28T16:45:18Z",
                hourly_rate: null,
                budget: null,
                task: {
                    id: 221,
                    name: "Task A"
                }
            }, {
                id: 123456,
                billable: false,
                is_active: true,
                created_at: "2017-09-11T16:12:33Z",
                updated_at: "2017-09-11T16:12:33Z",
                hourly_rate: null,
                budget: null,
                task: {
                    id: 222,
                    name: "Task B"
                }
            }]
        }],
        per_page: 100,
        total_pages: 1,
        total_entries: 3,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
            first: "https://api.harvestapp.com/v2/users/123456/project_assignments?page=1&per_page=100",
            next: null,
            previous: null,
            last: "https://api.harvestapp.com/v2/users/123456/project_assignments?page=1&per_page=100"
        }
    };
}