class RelativeTime {
    constructor(fromNow, unit) {
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

    toDate() {
        let resultDate = new Date();
        if (this._unit === RelativeTime.UNIT_HOUR) {
            const minutesToDisplace = this._fromNow === RelativeTime.FROM_NOW_THIS
                ? 0
                : this._fromNow === RelativeTime.FROM_NOW_LAST
                    ? -60
                    : 60;
            resultDate.setMinutes(minutesToDisplace, 0, 0);
            return resultDate;
        }

        if (this._unit === RelativeTime.UNIT_DAY) {
            const hoursToDisplace = this._fromNow === RelativeTime.FROM_NOW_THIS
                ? 0
                : this._fromNow === RelativeTime.FROM_NOW_LAST
                    ? -24
                    : 24;
            resultDate.setHours(hoursToDisplace, 0, 0, 0);
            return resultDate;
        }

        if (this._unit === RelativeTime.UNIT_WEEK) {
            const currentDayOfWeek = resultDate.getDay();
            const extraDisplacement = this._fromNow === RelativeTime.FROM_NOW_THIS
                ? 0
                : this._fromNow === RelativeTime.FROM_NOW_LAST
                    ? -7
                    : 7;
            const daysToDisplace = -currentDayOfWeek + extraDisplacement;
            resultDate.setHours(24 * daysToDisplace, 0, 0, 0);
            return resultDate;
        }

        // this._unit === RelativeTime.UNIT_MONTH
        resultDate.setDate(1);
        resultDate.setHours(0, 0, 0, 0);
        if (this._fromNow === RelativeTime.FROM_NOW_LAST)
            resultDate.setMonth(resultDate.getMonth() - 1);
        else if (this._fromNow === RelativeTime.FROM_NOW_NEXT)
            resultDate.setMonth(resultDate.getMonth() + 1);
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