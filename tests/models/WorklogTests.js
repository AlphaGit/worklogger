var assert = require('assert');
var Worklog = require('models/Worklog');

describe('Worklog', () => {
    describe('#constructor', () => {
        it('requires a name parameter', () => {
            assert.throws(() => buildWorklog({ name: null }));
        });

        it('requires a startDateTime parameter', () => {
            assert.throws(() => buildWorklog({ startDateTime: null }));
        });

        it('requires a endDateTime parameter', () => {
            assert.throws(() => buildWorklog({ endDateTime: null }));
        });

        it('calculates the duration from startDateTime and endDateTime parameters', () => {
            var worklog = buildWorklog({
                startDateTime: new Date('2016-01-01T00:00:00Z'),
                endDateTime: new Date('2016-01-01T01:00:00Z')
            });
            assert.equal(worklog.duration, 60);
        });

        it('preserves the duration if passed by parameter', () => {
            var worklog = buildWorklog({ duration: 70 });
            assert.equal(worklog.duration, 70);
        });

        it('saves values when all parameters are passed', () => {
            var now = new Date();
            var worklog = buildWorklog({ name: 'worklogName', startDateTime: now, endDateTime: now, duration: 1500 });
            assert.equal('worklogName', worklog.name);
            assert.equal(now, worklog.startDateTime);
            assert.equal(now, worklog.endDateTime);
            assert.equal(1500, worklog.duration);
        });
    });

    describe('#toString', () => {
        it('contains the worklog name', () => {
            var worklog = buildWorklog({ name: 'worklogName' });
            assert.ok(worklog.toString().indexOf('worklogName') >= 0);
        });

        it('contains the duration with the unit name', () => {
            var worklog = buildWorklog({ duration: 1500 });
            assert.ok(worklog.toString().indexOf('1500 minutes') >= 0);
        });

        it('contains all the tags that the worklog has', () => {
            var worklog = buildWorklog();
            worklog.addTag('tag1', 'tagContent1');
            worklog.addTag('tag2', 'tagContent2');

            const stringRepresentation = worklog.toString();

            assert(stringRepresentation.indexOf('tag1') > -1);
            assert(stringRepresentation.indexOf('tag2') > -1);
            assert(stringRepresentation.indexOf('tagContent1') > -1);
            assert(stringRepresentation.indexOf('tagContent2') > -1);
        });
    });

    describe('#addTag', () => {
        it('requires a tag name', () => {
            var worklog = buildWorklog();

            assert.throws(() => worklog.addTag(), /Tag names cannot be empty/);
            assert.throws(() => worklog.addTag(null), /Tag names cannot be empty/);
            assert.throws(() => worklog.addTag(undefined), /Tag names cannot be empty/);
        });

        it('validates that the tag name is a string', () => {
            var worklog = buildWorklog();

            assert.throws(() => worklog.addTag({}), /Tag names need to be strings/);
            assert.throws(() => worklog.addTag([]), /Tag names need to be strings/);
            assert.throws(() => worklog.addTag(15), /Tag names need to be strings/);
            assert.throws(() => worklog.addTag(0), /Tag names need to be strings/);
        });

        it('stores the value passed to the tag', () => {
            var worklog = buildWorklog();

            worklog.addTag('nullTag', null);
            worklog.addTag('undefinedTag', undefined);
            worklog.addTag('stringTag', 'string');
            worklog.addTag('numericTag', 0);

            worklog.assertTagValue('nullTag', null);
            worklog.assertTagValue('undefinedTag', undefined);
            worklog.assertTagValue('stringTag', 'string');
            worklog.assertTagValue('numericTag', 0);
        });
    });

    describe('#getTagValue', () => {
        it('requires a tag name', () => {
            var worklog = buildWorklog();

            assert.throws(() => worklog.getTagValue(), /Tag names cannot be empty/);
            assert.throws(() => worklog.getTagValue(null), /Tag names cannot be empty/);
            assert.throws(() => worklog.getTagValue(undefined), /Tag names cannot be empty/);
        });

        it('validates that the tag name is a string', () => {
            var worklog = buildWorklog();

            assert.throws(() => worklog.getTagValue({}), /Tag names need to be strings/);
            assert.throws(() => worklog.getTagValue([]), /Tag names need to be strings/);
            assert.throws(() => worklog.getTagValue(15), /Tag names need to be strings/);
            assert.throws(() => worklog.getTagValue(0), /Tag names need to be strings/);
        });

    });
});

function attachAssertionLogic(worklog) {
    worklog.assertTagValue = assertTagValue.bind(worklog);
}

function assertTagValue(tagName, tagExpectedValue) {
    assert.equal(tagExpectedValue, this.getTagValue(tagName));
}

function buildWorklog({
    name = 'Worklog Name',
    startDateTime = new Date(),
    endDateTime = new Date(),
    duration = undefined
} = {}) {
    var worklog = new Worklog(name, startDateTime, endDateTime, duration);
    attachAssertionLogic(worklog);
    return worklog;
}
