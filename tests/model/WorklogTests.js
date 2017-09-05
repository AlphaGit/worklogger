var assert = require('assert');
var Worklog = require('model/Worklog');

describe('Worklog', () => {
    describe('#constructor', () => {
        it('requires a name parameter', () => {
            assert.throws(() => new Worklog());
        });

        it('requires a startDateTime parameter', () => {
            assert.throws(() => new Worklog('worklogName'));
        });

        it('requires a endDateTime parameter', () => {
            assert.throws(() => new Worklog('worklogName', new Date()));
        });

        it('calculates the duration from startDateTime and endDateTime parameters', () => {
            var worklog = new Worklog('worklogName', new Date('2016-01-01T00:00:00Z'), new Date('2016-01-01T01:00:00Z'), undefined);
            assert.equal(worklog.duration, 60);
        });

        it('preserves the duration if passed by parameter', () => {
            var worklog = new Worklog('worklogName', new Date('2016-01-01T00:00:00Z'), new Date('2016-01-01T01:00:00Z'), 70);
            assert.equal(worklog.duration, 70);
        });

        it('saves values when all parameters are passed', () => {
            var now = new Date();
            var worklog = new Worklog('worklogName', now, now, 1500);
            assert.equal('worklogName', worklog.name);
            assert.equal(now, worklog.startDateTime);
            assert.equal(now, worklog.endDateTime);
            assert.equal(1500, worklog.duration);
        });
    });

    describe('#toString', () => {
        it('contains the worklog name', () => {
            var worklog = new Worklog('worklogName', new Date(), new Date(), 1500);
            assert.ok(worklog.toString().indexOf('worklogName') >= 0);
        });

        it('contains the duration with the unit name', () => {
            var worklog = new Worklog('worklogName', new Date(), new Date(), 1500);
            assert.ok(worklog.toString().indexOf('1500 minutes') >= 0);
        });
    });
});
