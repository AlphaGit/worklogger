const assert = require('assert');
const sinon = require('sinon');
const HarvestClient = require('app/outputs/HarvestApp/HarvestClient');

describe('HarvestClient', () => {
    describe('#constructor', () => {
        function assertConstructorThrows(constructorArgument, expectedError) {
            assert.throws(() => new HarvestClient(constructorArgument), expectedError);
        }

        function assertMissingConfiguration(configurationArgument) {
            assertConstructorThrows(configurationArgument, /Missing parameter: configuration\./);
        }

        it('requires a configuration object', () => {
            assertMissingConfiguration();
            assertMissingConfiguration(undefined);
            assertMissingConfiguration(null);
        });

        function assertRequiredAccountId(accountId) {
            assertConstructorThrows({ accountId }, /Required configuration: accountId\./);
        }

        it('requires accountId in the configuration object', () => {
            assertRequiredAccountId();
            assertRequiredAccountId(null);
            assertRequiredAccountId('');
        });

        function assertRequiredToken(token) {
            assertConstructorThrows({ accountId: 123, token }, /Required configuration: token\./);
        }

        it('requires a token in the configuration object', () => {
            assertRequiredToken();
            assertRequiredToken(null);
            assertRequiredToken('');
        });

        function assertRequiredContactInformation(contactInformation) {
            assertConstructorThrows({ accountId: 123, token: '123', contactInformation }, /Required configuration: contactInformation\./);
        }

        it('requires contactInformation in the configuration object', () => {
            assertRequiredContactInformation();
            assertRequiredContactInformation(undefined);
            assertRequiredContactInformation(null);
            assertRequiredContactInformation('');
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

        it('makes a call to HarvestApi with the right values', async () => {
            const fakeFetch = getFakeFetch();
            const fetchSpy = sinon.spy(fakeFetch);
            const harvestClient = getTestSubject({
                accountId: 12345,
                token: 'Auth123',
                contactInformation: 'contactInformation@example.com',
                fetch: fetchSpy
            });

            await harvestClient.getProjectsAndTasks();

            assert(fetchSpy.calledOnce);
            const firstArgument = fetchSpy.getCall(0).args[0];
            const secondArgument = fetchSpy.getCall(0).args[1];

            assert.equal(firstArgument, 'https://api.harvestapp.com/api/v2/users/me/project_assignments.json');
            assert.equal(secondArgument.headers['Authorization'], 'Bearer Auth123');
            assert.equal(secondArgument.headers['Harvest-Account-Id'], '12345');
            assert.equal(secondArgument.headers['User-Agent'], 'Worklogger (contactInformation@example.com)');
        });

        it('parses the response as json', async () => {
            const jsonStub = sinon.stub().returns(await getRealApiResponse());
            const fetchStub = sinon.stub().returns(await { json: jsonStub });
            const harvestClient = getTestSubject({
                fetch: fetchStub
            });

            await harvestClient.getProjectsAndTasks();
            assert(fetchStub.calledOnce);
            assert(jsonStub.calledOnce);
        });

        it('returns the project ids and names with task ids and names', async () => {
            const apiResponse = getRealApiResponse();
            const jsonStub = sinon.stub().returns(await apiResponse);
            const fetchStub = sinon.stub().returns(await { json: jsonStub });
            const harvestClient = getTestSubject({
                fetch: fetchStub
            });

            const result = await harvestClient.getProjectsAndTasks();
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
        });
    });

    describe('#saveNewTimeEntry', () => {
        async function assertTimeEntryError(timeEntryValue, expectedError) {
            const harvestClient = getTestSubject();
            await assert.rejects(async () => await harvestClient.saveNewTimeEntry(timeEntryValue), expectedError);
        }

        async function assertRequiredTimeEntry(timeEntryValue) {
            await assertTimeEntryError(timeEntryValue, /Required parameter: timeEntry\./);
        }

        it('requires a timeEntry object', async () => {
            await assertRequiredTimeEntry();
            await assertRequiredTimeEntry(null);
            await assertRequiredTimeEntry(undefined);
        });

        async function assertTimeEntryRequiresProjectId(project_id) {
            await assertTimeEntryError({ project_id }, /Time entry needs to have project_id\./);
        }

        it('requires that the time entry has a project_id', async () => {
            await assertTimeEntryRequiresProjectId();
            await assertTimeEntryRequiresProjectId(undefined);
            await assertTimeEntryRequiresProjectId(null);
        });

        async function assertTimeEntryRequiresTaskId(task_id) {
            await assertTimeEntryError({ project_id: 1, task_id }, /Time entry needs to have task_id\./);
        }

        it('requires that the time entry has a task_id', async () => {
            await assertTimeEntryRequiresTaskId();
            await assertTimeEntryRequiresTaskId(undefined);
            await assertTimeEntryRequiresTaskId(null);
        });

        async function assertTimeEntryRequiresSpentDate(spent_date) {
            await assertTimeEntryError({ project_id: 1, task_id: 1, spent_date }, /Time entry needs to have spent_date\./);
        }

        it('requires that the time entry has a spent_date', async () => {
            await assertTimeEntryRequiresSpentDate();
            await assertTimeEntryRequiresSpentDate(undefined);
            await assertTimeEntryRequiresSpentDate(null);
        });

        async function assertTimeEntryRequiresTimerStartedAt(timer_started_at) {
            await assertTimeEntryError({ project_id: 1, task_id: 1, spent_date: '2017-01-01', timer_started_at }, /Time entry needs to have timer_started_at\./);
        }

        it('requires that the time entry has a timer_started_at', async () => {
            await assertTimeEntryRequiresTimerStartedAt();
            await assertTimeEntryRequiresTimerStartedAt(null);
            await assertTimeEntryRequiresTimerStartedAt(undefined);
        });

        async function assertTimeEntryRequiresHours(hours) {
            await assertTimeEntryError({ project_id: 1, task_id: 1, spent_date: '2017-01-01', timer_started_at: '2017-01-01T07:00-0400', hours }, /Time entry needs to have hours\./);
        }

        it('requires that the time entry has hours', async () => {
            await assertTimeEntryRequiresHours();
            await assertTimeEntryRequiresHours(undefined);
            await assertTimeEntryRequiresHours(null);
        });

        it('calls the HarvestApi with the right parameters', async () => {
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
            
            await harvestClient.saveNewTimeEntry(timeEntry);
            assert(fetchSpy.calledOnce);
            const firstArgument = fetchSpy.getCall(0).args[0];
            const secondArgument = fetchSpy.getCall(0).args[1];

            assert.equal(firstArgument, 'https://api.harvestapp.com/api/v2/time_entries');
            assert.equal(secondArgument.headers['Authorization'], 'Bearer Auth123');
            assert.equal(secondArgument.headers['Harvest-Account-Id'], '12345');
            assert.equal(secondArgument.headers['User-Agent'], 'Worklogger (contactInformation@example.com)');

            assert.equal(secondArgument.method, 'POST');
            assert.deepEqual(JSON.parse(secondArgument.body), timeEntry);
        });
    });
});

function getFakeFetch() {
    return async function fakeFetch() {
        return await ({
            json: async function fakeJson() {
                return await getRealApiResponse();
            }
        });
    };
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
            created_at: '2017-07-07T12:09:45Z',
            updated_at: '2017-07-07T12:09:45Z',
            hourly_rate: null,
            project: {
                id: 11,
                name: 'Project A',
                code: ''
            },
            client: {
                id: 1,
                name: 'Client A'
            },
            task_assignments: [{
                id: 123456,
                billable: true,
                is_active: true,
                created_at: '2017-10-05T19:57:47Z',
                updated_at: '2017-10-05T19:57:47Z',
                hourly_rate: null,
                budget: null,
                task: {
                    id: 111,
                    name: 'Task A'
                }
            }, {
                id: 123456,
                billable: false,
                is_active: true,
                created_at: '2017-09-11T16:12:33Z',
                updated_at: '2017-09-11T16:12:33Z',
                hourly_rate: null,
                budget: null,
                task: {
                    id: 112,
                    name: 'Task B'
                }
            }]
        },
        {
            id: 123456,
            is_project_manager: false,
            is_active: true,
            budget: null,
            created_at: '2017-06-05T20:02:50Z',
            updated_at: '2017-06-05T20:02:50Z',
            hourly_rate: null,
            project: {
                id: 22,
                name: 'Project B',
                code: 'COD'
            },
            client: {
                id: 2,
                name: 'Client B'
            },
            task_assignments: [{
                id: 123456,
                billable: false,
                is_active: true,
                created_at: '2017-08-28T16:45:18Z',
                updated_at: '2017-08-28T16:45:18Z',
                hourly_rate: null,
                budget: null,
                task: {
                    id: 221,
                    name: 'Task A'
                }
            }, {
                id: 123456,
                billable: false,
                is_active: true,
                created_at: '2017-09-11T16:12:33Z',
                updated_at: '2017-09-11T16:12:33Z',
                hourly_rate: null,
                budget: null,
                task: {
                    id: 222,
                    name: 'Task B'
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
            first: 'https://api.harvestapp.com/v2/users/123456/project_assignments?page=1&per_page=100',
            next: null,
            previous: null,
            last: 'https://api.harvestapp.com/v2/users/123456/project_assignments?page=1&per_page=100'
        }
    };
}