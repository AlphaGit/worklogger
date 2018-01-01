const assert = require('assert');
const ModelMapper = require('app/inputs/GoogleCalendar/ModelMapper');
const Worklog = require('app/models/Worklog');

describe('[Google Calendar] ModelMapper', () => {
    describe('#constructor', () => {
        it('takes in a configuration parameter', () => {
            const mapper = new ModelMapper(17);
            assert.equal(17, mapper.minimumLoggableTimeSlotInMinutes);
        });
    });

    describe('#map', () => {
        it('maps to a Worklog with the correct information', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({
                eventName: 'My event name',
                startDateTime: '2017-08-28T20:30:00-05:00',
                endDateTime: '2017-08-28T21:00:00-05:00'
            });

            const result = mapper.map([apiResponse]);

            assert.equal(1, result.length);
            assert(result[0] instanceof Worklog);
            assert.equal('My event name', result[0].name);
            assert.equal(+new Date('2017-08-28T20:30:00-05:00'), +result[0].startDateTime);
            assert.equal(+new Date('2017-08-28T21:00:00-05:00'), +result[0].endDateTime);
            assert(result[0].startDateTime instanceof Date);
            assert(result[0].endDateTime instanceof Date);
            assert.equal(30, result[0].duration);
        });

        it('flattens arrays of arrays of events to a single array', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({ eventCount: 2 });
            const secondApiResponse = getTestApiResponse({ eventCount: 3 });

            const result = mapper.map([apiResponse, secondApiResponse]);

            assert.equal(5, result.length);
        });

        it('does nothing in the case of a falsy events response', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({ eventCount: 0 });
            apiResponse.events = null;

            const result = mapper.map([apiResponse]);

            assert(!!result);
            assert.equal(0, result.length);
        });

        it('restricts events to a configurable minimum loggable time slot', () => {
            const mapper = getMapper({ minimumLoggableTimeSlotInMinutes: 60 });
            const apiResponse = getTestApiResponse({
                eventName: 'My event name',
                startDateTime: '2017-08-28T20:30:00-05:00',
                endDateTime: '2017-08-28T21:00:00-05:00'
            });

            const result = mapper.map([apiResponse]);

            assert.equal(1, result.length);
            assert.equal(60, result[0].duration);
        });

        it('includes tags as indicated by the configuration for each calendar', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({ eventCount: 2, includeTags: ['client:Test Client', 'project:Test Project'] });

            const result = mapper.map([apiResponse]);

            assert.equal(2, result.length);

            const worklog1 = result[0];
            assert.equal('Test Client', worklog1.getTagValue('client'));
            assert.equal('Test Project', worklog1.getTagValue('project'));

            const worklog2 = result[1];
            assert.equal('Test Client', worklog2.getTagValue('client'));
            assert.equal('Test Project', worklog2.getTagValue('project'));
        });

        it('considers tags only after the first colon', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({ eventCount: 1, includeTags: ['test:Test', 'test1:Test:With:Colons'] });

            const result = mapper.map([apiResponse]);
            const worklog = result[0];
            assert.equal('Test', worklog.getTagValue('test'));
            assert.equal('Test:With:Colons', worklog.getTagValue('test1'));
        });

        it('doesn\'t include any tags if includeTags is empty', () => {
            const mapper = getMapper();
            const apiResponse = getTestApiResponse({ eventCount: 1, includeTags: null });

            const result = mapper.map([apiResponse]);
            const worklog = result[0];
            assert.equal(undefined, worklog.getTagValue('test'));
        });
    });
});

// Stubs for the instantiation of the test subject

function getMapper({
    minimumLoggableTimeSlotInMinutes = 30
} = {}) {
    return new ModelMapper(minimumLoggableTimeSlotInMinutes);
}

function getTestApiResponse({
    eventName = 'Test event',
    startDateTime = new Date().toISOString(),
    endDateTime = new Date(Date.now() + (1000 * 60 * 30)).toISOString(), // 30 mins later
    eventCount = 1,
    includeTags = [],
} = {}) {
    let apiResponse = {
        calendarConfig: {
            id: 'calendar1',
            includeTags: includeTags
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
