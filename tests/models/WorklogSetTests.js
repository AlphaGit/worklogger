const assert = require('assert');
const WorklogSet = require('models/WorklogSet');
const Worklog = require('models/Worklog');

describe('WorklogSet', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    function assertRequiredStartDateTime(startDateTime) {
        if (startDateTime == undefined) {
            assert.throws(() => new WorklogSet(), /Missing date parameter: startDateTime/);
        } else {
            assert.throws(() => getTestSubject({ startDateTime }), /Missing date parameter: startDateTime/);
        }
    }

    it('verifies that it receives a startDateTime parameter', () => {
        assertRequiredStartDateTime();
        assertRequiredStartDateTime(null);
        assertRequiredStartDateTime('some string');
        assertRequiredStartDateTime(5);
        assertRequiredStartDateTime([]);
        assertRequiredStartDateTime({});
    });

    function assertRequiredEndDateTime(endDateTime) {
        if (endDateTime == undefined) {
            assert.throws(() => new WorklogSet(new Date()), /Missing date parameter: endDateTime/);
        } else {
            assert.throws(() => getTestSubject({ endDateTime }), /Missing date parameter: endDateTime/);
        }
    }

    it('verifies that it receives a endDateTime parameter', () => {
        assertRequiredEndDateTime();
        assertRequiredEndDateTime(null);
        assertRequiredEndDateTime('some string');
        assertRequiredEndDateTime(5);
        assertRequiredEndDateTime([]);
        assertRequiredEndDateTime({});
    });

    function assertRequiredWorklogArray(worklogs) {
        if (worklogs == undefined) {
            assert.throws(() => new WorklogSet(new Date(), new Date()), /Missing array parameter: worklogs/);
        } else {
            assert.throws(() => getTestSubject({ worklogs }), /Missing array parameter: worklogs/);
        }
    }

    it('verifies that it receives a set of worklogs', () => {
        assertRequiredWorklogArray();
        assertRequiredWorklogArray(null);
        assertRequiredWorklogArray('some string');
        assertRequiredWorklogArray(5);
        assertRequiredWorklogArray({});
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
