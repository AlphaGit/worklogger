var assert = require('assert');
var GoogleCalendarInput = require('../../../inputs/GoogleCalendarInput/GoogleCalendarInput');
var GoogleCalendarInputConfiguration = require('../../../inputs/GoogleCalendarInput/GoogleCalendarInputConfiguration');

describe('GoogleCalendarInput', () => {
    describe('#constructor', () => {
        it('requires a configuration parameter', () => {
            assert.throws(() => new GoogleCalendarInput());

            var configurationJson = {
                name: 'test',
                calendars: [{
                    id: 'a',
                    client: 'My client',
                    project: 'My project'
                }],
                minimumLoggableTimeSlotInMinutes: 15
            };
            var configuration = new GoogleCalendarInputConfiguration(configurationJson);
            assert.doesNotThrow(() => new GoogleCalendarInput(configuration))
        });
    });
});
