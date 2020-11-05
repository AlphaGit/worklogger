const moment = require('moment-timezone');

class RelativeTime {
    constructor(fromNow, unit, timeZone) {
        this._buildDisplacementMappings();

        this._validateFromNowValue(fromNow);
        this._validateUnitValue(unit);

        this._fromNow = fromNow;
        this._unit = unit;
        this._timeZone = timeZone;
    }

    _validateUnitValue(unit) {
        const allowedValues = [
            RelativeTime.UNIT_HOUR,
            RelativeTime.UNIT_DAY,
            RelativeTime.UNIT_WEEK,
            RelativeTime.UNIT_MONTH,
        ];

        if (!allowedValues.includes(unit))
            throw new Error('Parameter required: unit.');
    }

    _validateFromNowValue(fromNow) {
        const allowedValues = [
            RelativeTime.FROM_NOW_LAST,
            RelativeTime.FROM_NOW_THIS,
            RelativeTime.FROM_NOW_NEXT,
        ]

        if (!allowedValues.includes(fromNow))
            throw new Error('Parameter required: fromNow.');
    }

    _buildDisplacementMappings() {
        const getMap = function buildDisplacementMapping(unit, fromNow, displacementFn) {
            return {
                unit,
                fromNow,
                displacementFn
            }
        }

        this._displacementMappings = [
            getMap(RelativeTime.UNIT_HOUR, RelativeTime.FROM_NOW_LAST, (dt) => dt.startOf('hour').subtract(1, 'hours')),
            getMap(RelativeTime.UNIT_HOUR, RelativeTime.FROM_NOW_THIS, (dt) => dt.startOf('hour')),
            getMap(RelativeTime.UNIT_HOUR, RelativeTime.FROM_NOW_NEXT, (dt) => dt.startOf('hour').add(1, 'hours')),

            getMap(RelativeTime.UNIT_DAY, RelativeTime.FROM_NOW_LAST, (dt) => dt.startOf('day').subtract(1, 'day')),
            getMap(RelativeTime.UNIT_DAY, RelativeTime.FROM_NOW_THIS, (dt) => dt.startOf('day')),
            getMap(RelativeTime.UNIT_DAY, RelativeTime.FROM_NOW_NEXT, (dt) => dt.startOf('day').add(1, 'day')),

            getMap(RelativeTime.UNIT_WEEK, RelativeTime.FROM_NOW_LAST, (dt) => dt.startOf('week').subtract(1, 'week')),
            getMap(RelativeTime.UNIT_WEEK, RelativeTime.FROM_NOW_THIS, (dt) => dt.startOf('week')),
            getMap(RelativeTime.UNIT_WEEK, RelativeTime.FROM_NOW_NEXT, (dt) => dt.startOf('week').add(1, 'week')),

            getMap(RelativeTime.UNIT_MONTH, RelativeTime.FROM_NOW_LAST, (dt) => dt.startOf('month').subtract(1, 'month')),
            getMap(RelativeTime.UNIT_MONTH, RelativeTime.FROM_NOW_THIS, (dt) => dt.startOf('month')),
            getMap(RelativeTime.UNIT_MONTH, RelativeTime.FROM_NOW_NEXT, (dt) => dt.startOf('month').add(1, 'month')),
        ];
    }

    toDate() {
        const displacementFn = this._displacementMappings
            .find(m => m.unit === this._unit && m.fromNow === this._fromNow)
            .displacementFn;

        let resultDate = moment.tz(this._timeZone);
        displacementFn(resultDate);
        return resultDate.toDate();
    }
}

// constants
RelativeTime.FROM_NOW_THIS = 'this';
RelativeTime.FROM_NOW_LAST = 'last';
RelativeTime.FROM_NOW_NEXT = 'next';

RelativeTime.UNIT_HOUR = 'hour';
RelativeTime.UNIT_DAY = 'day';
RelativeTime.UNIT_WEEK = 'week';
RelativeTime.UNIT_MONTH = 'month';

module.exports = RelativeTime;