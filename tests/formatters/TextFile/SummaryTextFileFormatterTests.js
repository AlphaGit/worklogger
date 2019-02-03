const assert = require('assert');
const SummaryTextFileFormatter = require('app/formatters/TextFile/SummaryTextFileFormatter');
const Worklog = require('app/models/Worklog');
const WorklogSet = require('app/models/WorklogSet');

require('tests/harness/log4js').setLevel('off');

describe('SummaryTextFileFormatter', () => {
    describe('#format method', () => {
        function assertMissingWorklogSet(formatter, worklogSet) {
            assert.throws(() => formatter.format(worklogSet), /Missing WorklogSet/);
        }

        it('verifies that it receives a WorklogSet', () => {
            const formatter = getTestSubject();

            assertMissingWorklogSet(formatter);
            assertMissingWorklogSet(formatter, null);
            assertMissingWorklogSet(formatter, 1);
            assertMissingWorklogSet(formatter, []);
            assertMissingWorklogSet(formatter, {});
        });

        it('includes the start date', () => {
            const worklogSet = getExampleWorklogSet({ startDateTime: new Date('2017-01-02') });
            const formatter = getTestSubject();

            const result = formatter.format(worklogSet);

            assert(result.indexOf('from 2017-01-02') > -1);
        });

        it('includes the end date', () => {
            const worklogSet = getExampleWorklogSet({ endDateTime: new Date('2017-02-01') });
            const formatter = getTestSubject();

            const result = formatter.format(worklogSet);

            assert(result.indexOf('to 2017-02-01') > -1);
        });

        it('includes the total duration of the worklogs (minutes only)', () => {
            const worklog1 = getExampleWorklogByDuration({ m: 1 });
            const worklog2 = getExampleWorklogByDuration({ startDateTime: worklog1.endDateTime, m: 1 });
            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1, worklog2] });

            const formatter = getTestSubject(worklogSet);

            const result = formatter.format(worklogSet);

            assert(result.indexOf('2m') > -1);
        });

        it('includes the total duration of the worklogs (hours and minutes)', () => {
            const worklog1 = getExampleWorklogByDuration({ h: 1, m: 1 });
            const worklog2 = getExampleWorklogByDuration({ startDateTime: worklog1.endDateTime, h: 1, m: 1 });
            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1, worklog2] });

            const formatter = getTestSubject(worklogSet);

            const result = formatter.format(worklogSet);

            assert(result.indexOf('Total time: 2hs 2m') > -1);
        });

        it('includes the total for aggregated tag', () => {
            const worklog1_1 = getExampleWorklogByDuration({ h: 1 });
            const worklog1_2 = getExampleWorklogByDuration({ h: 1 });
            const worklog2_1 = getExampleWorklogByDuration({ h: 1 });
            const worklog2_2 = getExampleWorklogByDuration({ h: 1 });

            worklog1_1.addTag('client', 'Client1');
            worklog1_2.addTag('client', 'Client1');

            worklog2_1.addTag('client', 'Client2');
            worklog2_2.addTag('client', 'Client2');

            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1_1, worklog1_2, worklog2_1, worklog2_2] });

            const formatter = getTestSubject({ aggregateByTags: [ ['client'] ] });

            const result = formatter.format(worklogSet);

            const lines = result.split('\n');

            const startDateTimeString = worklogSet.startDateTime.toISOString();
            const endDateTimeString = worklogSet.endDateTime.toISOString();

            assert.strictEqual(lines[ 0], `Worklogs from ${startDateTimeString} to ${endDateTimeString}.`);
            assert.strictEqual(lines[ 1], '');
            assert.strictEqual(lines[ 2], 'Total time by client:');
            assert.strictEqual(lines[ 3], '');
            assert.strictEqual(lines[ 4], '- [client] Client1: 2hs 0m');
            assert.strictEqual(lines[ 5], '- [client] Client2: 2hs 0m');
            assert.strictEqual(lines[ 6], '');
            assert.strictEqual(lines[ 7], 'Total time: 4hs 0m');
        });

        it('includes the total for multiple aggregated tags', () => {
            const worklog1_1 = getExampleWorklogByDuration({ h: 2 });
            const worklog2_2 = getExampleWorklogByDuration({ h: 2 });
            const worklog2_3 = getExampleWorklogByDuration({ m: 30 });

            worklog1_1.addTag('client', 'Client1');
            worklog2_2.addTag('client', 'Client2');
            worklog2_3.addTag('client', 'Client2');

            worklog1_1.addTag('project', 'Project1');
            worklog2_2.addTag('project', 'Project2');
            worklog2_3.addTag('project', 'Project3');

            const worklogSet = getExampleWorklogSet({
                startDateTime: new Date(2017, 1, 1, 8, 1, 2),
                endDateTime: new Date(2017, 1, 2, 23, 59, 59),
                worklogs: [worklog1_1, worklog2_2, worklog2_3]
            });

            const formatter = getTestSubject({ aggregateByTags: [ ['client', 'project'] ] });

            const result = formatter.format(worklogSet);

            const lines = result.split('\n');

            const startDateTimeString = worklogSet.startDateTime.toISOString();
            const endDateTimeString = worklogSet.endDateTime.toISOString();

            assert.strictEqual(lines[ 0], `Worklogs from ${startDateTimeString} to ${endDateTimeString}.`);
            assert.strictEqual(lines[ 1], '');
            assert.strictEqual(lines[ 2], 'Total time by client / project:');
            assert.strictEqual(lines[ 3], '');
            assert.strictEqual(lines[ 4], '- [client] Client1: 2hs 0m');
            assert.strictEqual(lines[ 5], '    - [project] Project1: 2hs 0m');
            assert.strictEqual(lines[ 6], '- [client] Client2: 2hs 30m');
            assert.strictEqual(lines[ 7], '    - [project] Project2: 2hs 0m');
            assert.strictEqual(lines[ 8], '    - [project] Project3: 0hs 30m');
            assert.strictEqual(lines[ 9], '');
            assert.strictEqual(lines[10], 'Total time: 4hs 30m');
        });

        it('does not perform any aggregation if aggregateByTags configuration is falsy', () => {
            const worklog = getExampleWorklogByDuration({ h: 1 });

            const worklogSet = getExampleWorklogSet({ worklogs: [worklog] });

            const formatter = getTestSubject({ aggregateByTags: null });

            const result = formatter.format(worklogSet);
            const lines = result.split('\n');

            const startDateTimeString = worklogSet.startDateTime.toISOString();
            const endDateTimeString = worklogSet.endDateTime.toISOString();

            assert.strictEqual(lines[ 0], `Worklogs from ${startDateTimeString} to ${endDateTimeString}.`);
            assert.strictEqual(lines[ 1], '');
            assert.strictEqual(lines[ 2], 'Total time: 1hs 0m');
        });
    });
});

function getTestSubject({
    aggregateByTags = []
} = {}) {
    const configuration = {
        aggregateByTags
    };
    return new SummaryTextFileFormatter(configuration);
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
    startDateTime = new Date(2017, 1, 1, 15, 0, 0),
    h = 0,
    m = 0
} = {}) {
    const endDateTime = new Date(+startDateTime + h * 60 * 60 * 1000 + m * 60 * 1000);
    return getExampleWorklog({ startDateTime, endDateTime });
}
