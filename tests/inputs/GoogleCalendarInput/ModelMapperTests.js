const assert = require('assert');
const ModelMapper = require('inputs/GoogleCalendarInput/ModelMapper');
const Worklog = require('model/Worklog');

require('tests/harness/log4js').setLevel('off');

describe('[Google Calendar] ModelMapper', () => {
    describe('#constructor', () => {
        it('takes in a configuration parameter', () => {
            const mapper = new ModelMapper({ minimumLoggableTimeSlotInMinutes: 17 });
            assert.equal(17, mapper.minimumLoggableTimeSlotInMinutes);
        });
    });

    describe('#map', () => {
        describe('maps to a Worklog with the correct information', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({
                client: 'My client',
                project: 'My project',
                eventName: 'My event name',
                startDateTime: '2017-08-28T20:30:00-05:00',
                endDateTime: '2017-08-28T21:00:00-05:00'
            });

            const result = mapper.map([apiResponse]);

            assert.equal(1, result.length);
            assert(result[0] instanceof Worklog);
            assert.equal('My client', result[0].client);
            assert.equal('My project', result[0].project);
            assert.equal('My event name', result[0].name);
            assert.equal(Date.parse('2017-08-28T20:30:00-05:00'), result[0].startDateTime);
            assert.equal(Date.parse('2017-08-28T21:00:00-05:00'), result[0].endDateTime);
            assert.equal(30, result[0].duration);
        });

        describe('flattens arrays of arrays of events to a single array', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({ eventCount: 2 });
            const secondApiResponse = getTestApiResponse({ eventCount: 3 });

            const result = mapper.map([apiResponse, secondApiResponse]);

            assert.equal(5, result.length);
        });

        describe('restricts events to a configurable minimum loggable time slot', () => {
            const mapper = getMapper({ minimumLoggableTimeSlotInMinutes: 60 });
            const apiResponse = getTestApiResponse({
                client: 'My client',
                project: 'My project',
                eventName: 'My event name',
                startDateTime: '2017-08-28T20:30:00-05:00',
                endDateTime: '2017-08-28T21:00:00-05:00'
            });

            const result = mapper.map([apiResponse]);

            assert.equal(1, result.length);
            assert.equal(60, result[0].duration);
        });
    });
});

// Stubs for the instantiation of the test subject

function getMapper({
    minimumLoggableTimeSlotInMinutes = 30
} = {}) {
    const configuration = {
        minimumLoggableTimeSlotInMinutes: minimumLoggableTimeSlotInMinutes
    };
    return new ModelMapper(configuration);
}

function getTestApiResponse({
    client = 'Test client',
    project = 'Test project',
    eventName = 'Test event',
    startDateTime = new Date().toISOString(),
    endDateTime = new Date(Date.now() + (1000 * 60 * 30)).toISOString(), // 30 mins later
    eventCount = 1,
} = {}) {
    let apiResponse = {
        calendarConfig: {
            client: client,
            project: project,
        },
        events: []
    };

    for (let i = 1; i <= eventCount; i++) {
        apiResponse.events.push({
            summary: eventName,
            start: {
                dateTime: startDateTime
            },
            end: {
                dateTime: endDateTime
            }
        });
    }

    return apiResponse;
}
