class RelativeTime {
    constructor(fromNow, unit) {
        this._buildDisplacementMappings();

        this._validateFromNowValue(fromNow);
        this._validateUnitValue(unit);

        this._fromNow = fromNow;
        this._unit = unit;
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
            getMap(RelativeTime.UNIT_HOUR, RelativeTime.FROM_NOW_LAST, (dt) => dt.setMinutes(-60, 0, 0)),
            getMap(RelativeTime.UNIT_HOUR, RelativeTime.FROM_NOW_THIS, (dt) => dt.setMinutes(0, 0, 0)),
            getMap(RelativeTime.UNIT_HOUR, RelativeTime.FROM_NOW_NEXT, (dt) => dt.setMinutes(60, 0, 0)),

            getMap(RelativeTime.UNIT_DAY, RelativeTime.FROM_NOW_LAST, (dt) => dt.setHours(-24, 0, 0, 0)),
            getMap(RelativeTime.UNIT_DAY, RelativeTime.FROM_NOW_THIS, (dt) => dt.setHours(0, 0, 0, 0)),
            getMap(RelativeTime.UNIT_DAY, RelativeTime.FROM_NOW_NEXT, (dt) => dt.setHours(24, 0, 0, 0)),

            getMap(RelativeTime.UNIT_WEEK, RelativeTime.FROM_NOW_LAST, (dt) => dt.setHours((-dt.getDay() - 7) * 24, 0, 0, 0)),
            getMap(RelativeTime.UNIT_WEEK, RelativeTime.FROM_NOW_THIS, (dt) => dt.setHours((-dt.getDay()) * 24, 0, 0, 0)),
            getMap(RelativeTime.UNIT_WEEK, RelativeTime.FROM_NOW_NEXT, (dt) => dt.setHours((-dt.getDay() + 7) * 24, 0, 0, 0)),

            getMap(RelativeTime.UNIT_MONTH, RelativeTime.FROM_NOW_LAST, (dt) => {
                dt.setMonth(dt.getMonth() - 1, 1);
                dt.setHours(0, 0, 0, 0);
            }),
            getMap(RelativeTime.UNIT_MONTH, RelativeTime.FROM_NOW_THIS, (dt) => {
                dt.setMonth(dt.getMonth(), 1);
                dt.setHours(0, 0, 0, 0);
            }),
            getMap(RelativeTime.UNIT_MONTH, RelativeTime.FROM_NOW_NEXT, (dt) => {
                dt.setMonth(dt.getMonth() + 1, 1);
                dt.setHours(0, 0, 0, 0);
            }),
        ];
    }

    toDate() {
        const displacementFn = this._displacementMappings
            .find(m => m.unit === this._unit && m.fromNow === this._fromNow)
            .displacementFn;

        let resultDate = new Date();
        displacementFn(resultDate);
        return resultDate;
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