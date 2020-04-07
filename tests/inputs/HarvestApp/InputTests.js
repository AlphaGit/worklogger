const assert = require('assert');
const sinon = require('sinon');
const Input = require('app/inputs/HarvestApp/Input');
const InputConfiguration = require('app/inputs/HarvestApp/InputConfiguration');

describe('[HarvestApp] Input', () => {
    describe('#constructor', () => {
        it('requires an input configuration parameter', () => {
            assert.throws(() => getTestSubject({ inputConfiguration: null }), /required/);
            assert.doesNotThrow(() => getTestSubject());
        });

        it('requires an app configuration parameter', () => {
            assert.throws(() => getTestSubject({ appConfiguration: null }), /required/);
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    describe('#getWorkLogs', () => {
        it('calls the harvest client to retrieve time entries', async () => {
            const timeEntries = defaultHarvestTimeEntries.slice(0, 1);
            const getTimeEntriesStub = sinon.stub().resolves(timeEntries);
            const harvestClient = function() {
                return {
                    getTimeEntries: getTimeEntriesStub
                }
            };
            const input = getTestSubject({ HarvestClient: harvestClient });

            const from = new Date(2020, 04, 06, 01, 02, 03);
            const to = new Date(2020, 05, 01, 01, 02, 03);
            await input.getWorkLogs(from, to);

            assert.ok(getTimeEntriesStub.calledOnce);

            assert.equal(getTimeEntriesStub.firstCall.args[0].from, from);
            assert.equal(getTimeEntriesStub.firstCall.args[0].to, to);
        });
    }); // #getWorkLogs
});

// Stubs for the instantiation of the test subject

const defaultAppConfiguration = {
    options: {
        minimumLoggableTimeSlotInMinutes: 15
    }
};

const defaultInputConfiguration = {
    type: 'HarvestApp',
    name: 'Harvest Test',
    accountId: '12345',
    token: 'abc123',
    contactInformation: 'test@example.com'
};

const defaultServiceRegistrations = {};

const defaultHarvestTimeEntries = [{
        id: 636709355,
        spent_date: '2017-03-02',
        user: {
            id: 1782959,
            name: 'Kim Allen'
        },
        client: {
            id: 5735774,
            name: 'ABC Corp'
        },
        project: {
            id: 14307913,
            name: 'Marketing Website'
        },
        task: {
            id: 8083365,
            name: 'Graphic Design'
        },
        user_assignment: {
            id: 125068553,
            is_project_manager: true,
            is_active: true,
            budget: null,
            created_at: '2017-06-26T22:32:52Z',
            updated_at: '2017-06-26T22:32:52Z',
            hourly_rate: 100.0
        },
        task_assignment: {
            id: 155502709,
            billable: true,
            is_active: true,
            created_at: '2017-06-26T21:36:23Z',
            updated_at: '2017-06-26T21:36:23Z',
            hourly_rate: 100.0,
            budget: null
        },
        hours: 2.11,
        rounded_hours: 2.25,
        notes: 'Adding CSS styling',
        created_at: '2017-06-27T15:50:15Z',
        updated_at: '2017-06-27T16:47:14Z',
        is_locked: true,
        locked_reason: 'Item Approved and Locked for this Time Period',
        is_closed: true,
        is_billed: false,
        timer_started_at: null,
        started_time: '3:00pm',
        ended_time: '5:00pm',
        is_running: false,
        invoice: null,
        external_reference: null,
        billable: true,
        budgeted: true,
        billable_rate: 100.0,
        cost_rate: 50.0
    },
    {
        id: 636708723,
        spent_date: '2017-03-01',
        user: {
            id: 1782959,
            name: 'Kim Allen'
        },
        client: {
            id: 5735776,
            name: '123 Industries'
        },
        project: {
            id: 14308069,
            name: 'Online Store - Phase 1'
        },
        task: {
            id: 8083366,
            name: 'Programming'
        },
        user_assignment: {
            id: 125068554,
            is_project_manager: true,
            is_active: true,
            budget: null,
            created_at: '2017-06-26T22:32:52Z',
            updated_at: '2017-06-26T22:32:52Z',
            hourly_rate: 100.0
        },
        task_assignment: {
            id: 155505014,
            billable: true,
            is_active: true,
            created_at: '2017-06-26T21:52:18Z',
            updated_at: '2017-06-26T21:52:18Z',
            hourly_rate: 100.0,
            budget: null
        },
        hours: 1.35,
        rounded_hours: 1.5,
        notes: 'Importing products',
        created_at: '2017-06-27T15:49:28Z',
        updated_at: '2017-06-27T16:47:14Z',
        is_locked: true,
        locked_reason: 'Item Invoiced and Approved and Locked for this Time Period',
        is_closed: true,
        is_billed: true,
        timer_started_at: null,
        started_time: '1:00pm',
        ended_time: '2:00pm',
        is_running: false,
        invoice: {
            id: 13150403,
            number: '1001'
        },
        external_reference: null,
        billable: true,
        budgeted: true,
        billable_rate: 100.0,
        cost_rate: 50.0
    },
    {
        id: 636708574,
        spent_date: '2017-03-01',
        user: {
            id: 1782959,
            name: 'Kim Allen'
        },
        client: {
            id: 5735776,
            name: '123 Industries'
        },
        project: {
            id: 14308069,
            name: 'Online Store - Phase 1'
        },
        task: {
            id: 8083369,
            name: 'Research'
        },
        user_assignment: {
            id: 125068554,
            is_project_manager: true,
            is_active: true,
            budget: null,
            created_at: '2017-06-26T22:32:52Z',
            updated_at: '2017-06-26T22:32:52Z',
            hourly_rate: 100.0
        },
        task_assignment: {
            id: 155505016,
            billable: false,
            is_active: true,
            created_at: '2017-06-26T21:52:18Z',
            updated_at: '2017-06-26T21:54:06Z',
            hourly_rate: 100.0,
            budget: null
        },
        hours: 1.0,
        rounded_hours: 1.0,
        notes: 'Evaluating 3rd party libraries',
        created_at: '2017-06-27T15:49:17Z',
        updated_at: '2017-06-27T16:47:14Z',
        is_locked: true,
        locked_reason: 'Item Approved and Locked for this Time Period',
        is_closed: true,
        is_billed: false,
        timer_started_at: null,
        started_time: '11:00am',
        ended_time: '12:00pm',
        is_running: false,
        invoice: null,
        external_reference: null,
        billable: false,
        budgeted: true,
        billable_rate: null,
        cost_rate: 50.0
    },
    {
        id: 636707831,
        spent_date: '2017-03-01',
        user: {
            id: 1782959,
            name: 'Kim Allen'
        },
        client: {
            id: 5735776,
            name: '123 Industries'
        },
        project: {
            id: 14308069,
            name: 'Online Store - Phase 1'
        },
        task: {
            id: 8083368,
            name: 'Project Management'
        },
        user_assignment: {
            id: 125068554,
            is_project_manager: true,
            is_active: true,
            budget: null,
            created_at: '2017-06-26T22:32:52Z',
            updated_at: '2017-06-26T22:32:52Z',
            hourly_rate: 100.0
        },
        task_assignment: {
            id: 155505015,
            billable: true,
            is_active: true,
            created_at: '2017-06-26T21:52:18Z',
            updated_at: '2017-06-26T21:52:18Z',
            hourly_rate: 100.0,
            budget: null
        },
        hours: 2.0,
        rounded_hours: 2.0,
        notes: 'Planning meetings',
        created_at: '2017-06-27T15:48:24Z',
        updated_at: '2017-06-27T16:47:14Z',
        is_locked: true,
        locked_reason: 'Item Invoiced and Approved and Locked for this Time Period',
        is_closed: true,
        is_billed: true,
        timer_started_at: null,
        started_time: '9:00am',
        ended_time: '11:00am',
        is_running: false,
        invoice: {
            id: 13150403,
            number: '1001'
        },
        external_reference: null,
        billable: true,
        budgeted: true,
        billable_rate: 100.0,
        cost_rate: 50.0
    }
];

const defaultHarvestClient = function() {
    return {
        getTimeEntries: sinon.stub().resolves(defaultHarvestTimeEntries)
    }
};

function getTestSubject({
    serviceRegistrations = defaultServiceRegistrations,
    appConfiguration = defaultAppConfiguration,
    inputConfiguration = defaultInputConfiguration,
    HarvestClient = defaultHarvestClient } = {}) {

    const inputConfigurationInstance = inputConfiguration
        ? new InputConfiguration(inputConfiguration)
        : undefined;

    return new Input(serviceRegistrations, appConfiguration, inputConfigurationInstance, { HarvestClient });
}
