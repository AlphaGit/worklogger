const assert = require('assert');
const SummaryTextFileFormatter = require('formatters/textFile/SummaryTextFileFormatter');
const Worklog = require('model/Worklog');
const WorklogSet = require('model/WorklogSet');

require('tests/harness/log4js').setLevel('off');

describe('SummaryTextFileFormatter', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    describe('#formatWorklogs method', () => {
        it('exists', () => {
            const formatter = getTestSubject();
            assert.equal(typeof formatter.formatWorklogs, 'function');
        });

        it('verifies that it receives a WorklogSet', () => {
            const formatter = getTestSubject();

            assert.throws(() => formatter.formatWorklogs(), /Missing WorklogSet/);
            assert.throws(() => formatter.formatWorklogs(null), /Missing WorklogSet/);
            assert.throws(() => formatter.formatWorklogs(1), /Missing WorklogSet/);
            assert.throws(() => formatter.formatWorklogs([]), /Missing WorklogSet/);
            assert.throws(() => formatter.formatWorklogs({}), /Missing WorklogSet/);
        });
    
        it('includes the start date', () => {
            const worklogSet = getExampleWorklogSet({ startDateTime: new Date('2017-01-02') });
            const formatter = getTestSubject();

            const result = formatter.formatWorklogs(worklogSet);

            assert(result.indexOf('from 2017-01-02') > -1);
        });

        it('includes the end date', () => {
            const worklogSet = getExampleWorklogSet({ endDateTime: new Date('2017-02-01') });
            const formatter = getTestSubject();

            const result = formatter.formatWorklogs(worklogSet);

            assert(result.indexOf('to 2017-02-01') > -1);
        });

        it('includes the total duration of the worklogs (minutes only)', () => {
            const worklog1 = getExampleWorklogByDuration({ m: 1 });
            const worklog2 = getExampleWorklogByDuration({ startDateTime: worklog1.endDateTime, m: 1 });
            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1, worklog2] });

            const formatter = getTestSubject(worklogSet);

            const result = formatter.formatWorklogs(worklogSet);

            assert(result.indexOf('2m') > -1);
        });

        it('includes the total duration of the worklogs (hours and minutes)', () => {
            const worklog1 = getExampleWorklogByDuration({ h: 1, m: 1 });
            const worklog2 = getExampleWorklogByDuration({ startDateTime: worklog1.endDateTime, h: 1, m: 1 });
            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1, worklog2] });

            const formatter = getTestSubject(worklogSet);

            const result = formatter.formatWorklogs(worklogSet);

            assert(result.indexOf('Total time: 2hs 2m') > -1);
        });

        it('includes the total duration of the worklogs (hours only)', () => {
            const worklog1 = getExampleWorklogByDuration({ h: 1 });
            const worklog2 = getExampleWorklogByDuration({ startDateTime: worklog1.endDateTime, h: 1 });
            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1, worklog2] });

            const formatter = getTestSubject(worklogSet);

            const result = formatter.formatWorklogs(worklogSet);

            assert(result.indexOf('Total time: 2hs 0m') > -1);
        });

    });
});

function getTestSubject() {
    return new SummaryTextFileFormatter();
}

function getExampleWorklog({
    name = 'worklog name',
    startDateTime = new Date(),
    endDateTime = new Date()
}) {
    return new Worklog(name, startDateTime, endDateTime);
}

function getExampleWorklogSet({
    startDateTime = new Date(),
    endDateTime = new Date(),
    worklogs = [
        getExampleWorklog({ name: 'worklog 1' }),
        getExampleWorklog({ name: 'worklog 2' })
    ]
} = {}) {
    return new WorklogSet(startDateTime, endDateTime, worklogs);
}

function getExampleWorklogByDuration({
    startDateTime = new Date(2017, 01, 01, 15, 0, 0),
    h = 0,
    m = 0
} = {}) {
    const endDateTime = new Date(+startDateTime + h * 60 * 60 * 1000 + m * 60 * 1000);
    return getExampleWorklog({ startDateTime, endDateTime });
}