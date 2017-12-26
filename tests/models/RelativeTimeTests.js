const assert = require('assert');
const RelativeTime = require('models/RelativeTime');

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
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_HOUR);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_HOUR);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_DAY);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_DAY);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_WEEK);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_WEEK);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_MONTH);
            assertCanBeInstantiatedWith(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_MONTH);
        });
    });

    describe('constants', () => {
        it('has a FROM_NOW_THIS constant defined', () => {
            assert(RelativeTime.FROM_NOW_THIS);
        });

        it('has a FROM_NOW_LAST constant defined', () => {
            assert(RelativeTime.FROM_NOW_LAST);
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
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_HOUR);
            let expectedDate = new Date();
            expectedDate.setMinutes(-60, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });

        it('returns the right value for this hour', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_HOUR);
            let expectedDate = new Date();
            expectedDate.setMinutes(0, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });

        it('returns the right value for last day', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_DAY);
            let expectedDate = new Date();
            expectedDate.setHours(-24, 0, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });

        it('returns the right value for this day', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_DAY);
            let expectedDate = new Date();
            expectedDate.setHours(0, 0, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });

        it('returns the right value for last week', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_WEEK);
            let expectedDate = new Date();
            const dayOfWeek = expectedDate.getDay();
            expectedDate.setHours(-24 * (dayOfWeek + 7), 0, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });

        it('returns the right value for this week', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_WEEK);
            let expectedDate = new Date();
            const dayOfWeek = expectedDate.getDay();
            expectedDate.setHours(-24 * dayOfWeek, 0, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });

        it('returns the right value for last month', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_LAST, RelativeTime.UNIT_MONTH);
            let expectedDate = new Date();
            expectedDate.setMonth(expectedDate.getMonth() - 1, 1);
            expectedDate.setHours(0, 0, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });

        it('returns the right value for this month', () => {
            const relativeTime = new RelativeTime(RelativeTime.FROM_NOW_THIS, RelativeTime.UNIT_MONTH);
            let expectedDate = new Date();
            expectedDate.setDate(1);
            expectedDate.setHours(0, 0, 0, 0, 0);

            assert.equal(+relativeTime.toDate(), +expectedDate);
        });
    });
});