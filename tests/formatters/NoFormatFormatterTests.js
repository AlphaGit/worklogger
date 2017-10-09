const assert = require('assert');
const NoFormatFormatter = require('formatters/NoFormatFormatter');
const Worklog = require('models/Worklog');
const WorklogSet = require('models/WorklogSet');

describe('NoFormatFormatter', () => {
    describe('#format', () => {
        it('returns the same object as it is being given', () => {
            const formatter = new NoFormatFormatter({});
            const worklogSet = getExampleWorklogSet();
            const result = formatter.format(worklogSet);
            assert.deepEqual(result, worklogSet);
        });
    });
});

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
