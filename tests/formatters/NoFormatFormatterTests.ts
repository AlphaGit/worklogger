import assert = require('assert');
import { FormatterConfigurationBase } from '../../app/formatters/FormatterConfigurationBase';
import { NoFormatFormatter } from '../../app/formatters/NoFormat';
import { Worklog } from '../../app/models/Worklog';
import { WorklogSet } from '../../app/models/WorklogSet';

describe('NoFormatFormatter', () => {
    describe('#format', () => {
        it('returns the same object as it is being given', () => {
            const config = new FormatterConfigurationBase();
            const formatter = new NoFormatFormatter(config, {});
            const worklogSet = getExampleWorklogSet();
            const result = formatter.format(worklogSet);
            assert.strictEqual(result, worklogSet.toString());
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
