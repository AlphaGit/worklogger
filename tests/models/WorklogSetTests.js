const assert = require('assert');
const WorklogSet = require('models/WorklogSet');
const Worklog = require('models/Worklog');

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

    describe('#getFilteredCopy', () => {
        it('returns a new WorklogSet', () => {
            const workLogSet = getTestSubject();

            const result = workLogSet.getFilteredCopy(() => true);

            assert(result instanceof WorklogSet);
            assert.notStrictEqual(result, workLogSet);
        });

        it('returns a WorklogSet with the same and end datetimes', () => {
            const workLogSet = getTestSubject();

            const result = workLogSet.getFilteredCopy(() => true);

            assert.equal(result.startDateTime, workLogSet.startDateTime);
            assert.equal(result.endDateTime, workLogSet.endDateTime);
        });

        it('returns a WorklogSet with worklogs filtered', () => {
            const worklogs = [
                new Worklog('short', new Date(), new Date()),
                new Worklog('long name over here', new Date(), new Date()),
                new Worklog('short n', new Date(), new Date()),
                new Worklog('long name over here', new Date(), new Date()),
                new Worklog('short name', new Date(), new Date()),
                new Worklog('long name over here', new Date(), new Date()),
            ];
            const worklogSet = getTestSubject({ worklogs });

            const result = worklogSet.getFilteredCopy((w) => w.name.length > 10);
            assert.equal(result.worklogs.length, 3);
            assert.equal(result.worklogs[0].name, 'long name over here');
            assert.equal(result.worklogs[1].name, 'long name over here');
            assert.equal(result.worklogs[2].name, 'long name over here');
        });
    });

    describe('#toString', () => {
        it('returns a string representation of the WorklogSet', () => {
            const startDateTime = new Date('2017-01-01T17:30:00.000Z');
            const endDateTime = new Date('2017-01-02T08:00:00.000Z');
            const worklogSet = getTestSubject({ startDateTime, endDateTime });

            const string = worklogSet.toString();

            assert.equal(string, '2017-01-01T17:30:00.000Z - 2017-01-02T08:00:00.000Z');
        });
    });
});

function getTestSubject({
    startDateTime = new Date(),
    endDateTime = new Date(),
    worklogs = []
} = {}) {
    return new WorklogSet(startDateTime, endDateTime, worklogs);
}
