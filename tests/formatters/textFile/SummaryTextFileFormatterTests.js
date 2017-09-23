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

            assert(result.indexOf('2017-01-02') > -1);
        });

        it('includes the end date', () => {
            const worklogSet = getExampleWorklogSet({ endDateTime: new Date('2017-02-01') });
            const formatter = getTestSubject();

            const result = formatter.formatWorklogs(worklogSet);

            assert(result.indexOf('2017-02-01') > -1);
        });
    });
});

function getTestSubject() {
    return new SummaryTextFileFormatter();
}

function getExampleWorklogSet({
    startDateTime = new Date(),
    endDateTime = new Date()
} = {}) {
    const worklog = new Worklog('some name', new Date(), new Date());

    return new WorklogSet(startDateTime, endDateTime, [worklog]);
}