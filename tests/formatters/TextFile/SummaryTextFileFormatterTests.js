const assert = require('assert');
const SummaryTextFileFormatter = require('formatters/TextFile/SummaryTextFileFormatter');
const Worklog = require('models/Worklog');
const WorklogSet = require('models/WorklogSet');

require('tests/harness/log4js').setLevel('off');

describe('SummaryTextFileFormatter', () => {
    describe('#format method', () => {
        it('verifies that it receives a WorklogSet', () => {
            const formatter = getTestSubject();

            assert.throws(() => formatter.format(), /Missing WorklogSet/);
            assert.throws(() => formatter.format(null), /Missing WorklogSet/);
            assert.throws(() => formatter.format(1), /Missing WorklogSet/);
            assert.throws(() => formatter.format([]), /Missing WorklogSet/);
            assert.throws(() => formatter.format({}), /Missing WorklogSet/);
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

        it('includes the total duration of the worklogs (hours only)', () => {
            const worklog1 = getExampleWorklogByDuration({ h: 1 });
            const worklog2 = getExampleWorklogByDuration({ startDateTime: worklog1.endDateTime, h: 1 });
            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1, worklog2] });

            const formatter = getTestSubject(worklogSet);

            const result = formatter.format(worklogSet);

            assert(result.indexOf('Total time: 2hs 0m') > -1);
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

            assert(result.indexOf('Total time for Client1: 2hs 0m') > -1);
            assert(result.indexOf('Total time for Client2: 2hs 0m') > -1);
        });

        it('includes the total for multiple aaggregated tags', () => {
            const worklog1_1 = getExampleWorklogByDuration({ h: 2 });
            const worklog2_2 = getExampleWorklogByDuration({ h: 2 });
            const worklog2_3 = getExampleWorklogByDuration({ m: 30 });

            worklog1_1.addTag('client', 'Client1');
            worklog2_2.addTag('client', 'Client2');
            worklog2_3.addTag('client', 'Client2');

            worklog1_1.addTag('project', 'Project1');
            worklog2_2.addTag('project', 'Project2');
            worklog2_3.addTag('project', 'Project3');

            const worklogSet = getExampleWorklogSet({ worklogs: [worklog1_1, worklog2_2, worklog2_3] });

            const formatter = getTestSubject({ aggregateByTags: [ ['client', 'project'] ] });

            const result = formatter.format(worklogSet);

            assert(result.indexOf('Total time by client / project:') > -1);

            assert(result.indexOf('- Total time for Client1: 2hs 0m') > -1);
            assert(result.indexOf('- Total time for Client2: 2hs 30m') > -1);

            assert(result.indexOf('    - Total time for Project1: 2hs 0m') > -1);
            assert(result.indexOf('    - Total time for Project2: 2hs 0m') > -1);
            assert(result.indexOf('    - Total time for Project3: 0hs 30m') > -1);
        });

        //TODO test for duration by client tag (hh:mm)
        //TODO test for duration by project tag (hh:mm)
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
