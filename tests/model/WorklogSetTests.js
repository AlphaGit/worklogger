const assert = require('assert');
const WorklogSet = require('model/WorklogSet');

describe('WorklogSet', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    it('verifies that it receives a startDateTime parameter', () => {
        assert.throws(() => new WorklogSet(), /Missing date parameter: startDateTime/);
        assert.throws(() => getTestSubject({ startDateTime: null }), /Missing date parameter: startDateTime/);
        assert.throws(() => getTestSubject({ startDateTime: 'some string' }), /Missing date parameter: startDateTime/);
        assert.throws(() => getTestSubject({ startDateTime: 5 }), /Missing date parameter: startDateTime/);
        assert.throws(() => getTestSubject({ startDateTime: [] }), /Missing date parameter: startDateTime/);
        assert.throws(() => getTestSubject({ startDateTime: {} }), /Missing date parameter: startDateTime/);
    });

    it('verifies that it receives a endDateTime parameter', () => {
        assert.throws(() => new WorklogSet(new Date()), /Missing date parameter: endDateTime/);
        assert.throws(() => getTestSubject({ endDateTime: null }), /Missing date parameter: endDateTime/);
        assert.throws(() => getTestSubject({ endDateTime: 'some string' }), /Missing date parameter: endDateTime/);
        assert.throws(() => getTestSubject({ endDateTime: 5 }), /Missing date parameter: endDateTime/);
        assert.throws(() => getTestSubject({ endDateTime: [] }), /Missing date parameter: endDateTime/);
        assert.throws(() => getTestSubject({ endDateTime: {} }), /Missing date parameter: endDateTime/);
    });

    it('verifies that it receives a set of worklogs', () => {
        assert.throws(() => new WorklogSet(new Date(), new Date()), /Missing array parameter: worklogs/);
        assert.throws(() => getTestSubject({ worklogs: null }), /Missing array parameter: worklogs/);
        assert.throws(() => getTestSubject({ worklogs: 'some string' }), /Missing array parameter: worklogs/);
        assert.throws(() => getTestSubject({ worklogs: 5 }), /Missing array parameter: worklogs/);
        assert.throws(() => getTestSubject({ worklogs: {} }), /Missing array parameter: worklogs/);
    });
});

function getTestSubject({
    startDateTime = new Date(),
    endDateTime = new Date(),
    worklogs = []
} = {}) {
    return new WorklogSet(startDateTime, endDateTime, worklogs);
}