const assert = require('assert');
const RelativeTime = require('app/models/RelativeTime');
const moment = require('moment-timezone');

const defaultTimezone = 'America/Toronto';

function getCurrentMoment() {
    return moment.tz(defaultTimezone);
}

describe('RelativeTime', () => {
    describe('#constructor', () => {
        function assertFromNowRequired(fromNow) {
            assert.throws(() => new RelativeTime(fromNow), /Parameter required: fromNow\./);
        }

        it('requires a fromNow parameter', () => {
            assertFromNowRequired();
            assertFromNowRequired(1);
            assertFromNowRequired('something');
        });

        function assertUnitRequired(unit) {
            assert.throws(() => new RelativeTime(RelativeTime.FROM_NOW_LAST, unit), /Parameter required: unit\./);
        }

        it('requires a unit parameter', () => {
            assertUnitRequired();
            assertUnitRequired(1);
            assertUnitRequired('something');
        });

        function assertCanBeInstantiatedWith(fromNow, unit) {
            assert.doesNotThrow(() => new RelativeTime(fromNow, unit));
        }

        it('can be instantiated with the right parameters', () => {
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_HOUR, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_HOUR, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_NEXT, RelativeTime.UNIT_HOUR, defaultTimezone);

            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_DAY, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_DAY, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_NEXT, RelativeTime.UNIT_DAY, defaultTimezone);

            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_WEEK, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_WEEK, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_WEEK, defaultTimezone);

            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_MONTH, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_MONTH, defaultTimezone);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_NEXT, RelativeTime.UNIT_MONTH, defaultTimezone);
        });

        it('works in different timezones', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_MONTH, 'America/Buenos_Aires');
            const lastMonth = getCurrentMoment('America/Buenos_Aires').startOf('month').subtract(1, 'month');

            assert.notStrictEqual(relativeTime.toDate(), lastMonth);
        });
    });

    describe('constants', () => {
        it('has a FROM_NOW_THIS constant defined', () => {
            assert(RelativeTime.FROM_NOW_THIS);
        });

        it('has a FROM_NOW_LAST constant defined', () => {
            assert(RelativeTime.FROM_NOW_LAST);
        });

        it('has a FROM_NOW_NEXT constant defined', () => {
            assert(RelativeTime.FROM_NOW_NEXT);
        });

        it('has a UNIT_HOUR constant defined', () => {
            assert(RelativeTime.UNIT_HOUR);
        });

        it('has a UNIT_DAY constant defined', () => {
            assert(RelativeTime.UNIT_DAY);
        });

        it('has a UNIT_WEEK constant defined', () => {
            assert(RelativeTime.UNIT_WEEK);
        });

        it('has a UNIT_MONTH constant defined', () => {
            assert(RelativeTime.UNIT_MONTH);
        });
    });

    describe('#toDate', () => {
        it('returns the right value for last hour', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_HOUR, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('hour').subtract(1, 'hour');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for this hour', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_HOUR, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('hour').subtract(1, 'hour');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for next hour', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_NEXT, RelativeTime.UNIT_HOUR, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('hour').add(1, 'hour');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for last day', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_DAY, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('day').subtract(1, 'day');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for this day', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_DAY, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('day').subtract(1, 'day');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for next day', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_NEXT, RelativeTime.UNIT_DAY, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('day').add(1, 'day');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for last week', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_WEEK, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('week').subtract(1, 'week');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for this week', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_WEEK, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('week');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for next week', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_NEXT, RelativeTime.UNIT_WEEK, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('week').add(1, 'week');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for last month', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_MONTH, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('month').subtract(1, 'month');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for this month', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_MONTH, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('month');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });

        it('returns the right value for next month', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_NEXT, RelativeTime.UNIT_MONTH, defaultTimezone);
            const expectedDate = getCurrentMoment().startOf('month').add(1, 'month');

            assert.notStrictEqual(relativeTime.toDate(), expectedDate);
        });
    });
});