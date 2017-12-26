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

        function assertStartDateTimeIsDate(startDateTime) {
            assert.throws(() => buildWorklog({ startDateTime }), /startDateTime needs to be a Date\./);
        };

        it('requires the startDateTime parameter to be a Date', () => {
            assertStartDateTimeIsDate(1);
            assertStartDateTimeIsDate([]);
            assertStartDateTimeIsDate({});
        });

        it('requires a endDateTime parameter', () => {
            assert.throws(() => buildWorklog({ endDateTime: null }));
        });

        function assertEndDateTimeIsDate(endDateTime) {
            assert.throws(() => buildWorklog({ endDateTime }), /endDateTime needs to be a Date\./);
        };

        it('requires the endDateTime parameter to be a Date', () => {
            assertEndDateTimeIsDate(1);
            assertEndDateTimeIsDate([]);
            assertEndDateTimeIsDate({});
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

    describe('#toOneLinerString', () => {
        it('provides a short description of the worklog', () => {
            let worklog = buildWorklog({ name: 'Worklog', duration: 90 });
            worklog.addTag('tag1', 'tagContent1');

            const stringRepresentation = worklog.toOneLinerString();

            assert.equal(stringRepresentation, '(1 hs 30 mins) Worklog [tag1:tagContent1]');
        });

        it('does not include hours if its less than one', () => {
            let worklog = buildWorklog({ name: 'Worklog', duration: 30 });

            const stringRepresentation = worklog.toOneLinerString();

            assert.equal(stringRepresentation, '(30 mins) Worklog');
        });

        it('does not include minutes if they are exactly zero', () => {
            let worklog = buildWorklog({ name: 'Worklog', duration: 120 });

            const stringRepresentation = worklog.toOneLinerString();

            assert.equal(stringRepresentation, '(2 hs) Worklog');
        });
    });

    function assertTagNameCannotBeEmpty(fn, tag) {
        var worklog = buildWorklog();
        assert.throws(() => fn.call(worklog, tag), /Tag names cannot be empty/);
    }

    function assertTagIsAString(fn, tag) {
        var worklog = buildWorklog();
        assert.throws(() => fn.call(worklog, tag), /Tag names need to be strings/);
    }

    describe('#addTag', () => {
        function assertTagNameCannotBeEmptyOnAdd(tag) {
            assertTagNameCannotBeEmpty(Worklog.prototype.addTag, tag);
        }

        it('requires a tag name', () => {
            assertTagNameCannotBeEmptyOnAdd();
            assertTagNameCannotBeEmptyOnAdd(null);
            assertTagNameCannotBeEmptyOnAdd(undefined);
        });

        function assertTagIsAStringOnAdd(tag) {
            assertTagIsAString(Worklog.prototype.addTag, tag);
        }

        it('validates that the tag name is a string', () => {
            assertTagIsAStringOnAdd({});
            assertTagIsAStringOnAdd([]);
            assertTagIsAStringOnAdd(15);
            assertTagIsAStringOnAdd(0);
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
        function assertTagNameCannotBeEmptyOnGet(tag) {
            assertTagNameCannotBeEmpty(Worklog.prototype.getTagValue, tag);
        }

        it('requires a tag name', () => {
            assertTagNameCannotBeEmptyOnGet();
            assertTagNameCannotBeEmptyOnGet(null);
            assertTagNameCannotBeEmptyOnGet(undefined);
        });

        function assertTagIsAStringOnGet(tag) {
            assertTagIsAString(Worklog.prototype.getTagValue, tag);
        }

        it('validates that the tag name is a string', () => {
            assertTagIsAStringOnGet({});
            assertTagIsAStringOnGet([]);
            assertTagIsAStringOnGet(15);
            assertTagIsAStringOnGet(0);
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
