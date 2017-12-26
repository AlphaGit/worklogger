class RelativeTime {
    constructor(fromNow, unit) {
        this._validateFromNowValue(fromNow);
        this._validateUnitValue(unit);

        this._fromNow = fromNow;
        this._unit = unit;
    }

    _validateUnitValue(unit) {
        if (unit !== RelativeTime.UNIT_HOUR
            && unit !== RelativeTime.UNIT_DAY
            && unit !== RelativeTime.UNIT_WEEK
            && unit !== RelativeTime.UNIT_MONTH)
            throw new Error('Parameter required: unit.');
    }

    _validateFromNowValue(fromNow) {
        if (fromNow !== RelativeTime.FROM_NOW_THIS && fromNow !== RelativeTime.FROM_NOW_LAST)
            throw new Error('Parameter required: fromNow.');
    }

    toDate() {
        let resultDate = new Date();
        if (this._unit === RelativeTime.UNIT_HOUR) {
            const minutesToDisplace = this._fromNow === RelativeTime.FROM_NOW_THIS ? 0 : -60;
            resultDate.setMinutes(minutesToDisplace, 0, 0);
            return resultDate;
        }

        if (this._unit === RelativeTime.UNIT_DAY) {
            const hoursToDisplace = this._fromNow === RelativeTime.FROM_NOW_THIS ? 0 : -24;
            resultDate.setHours(hoursToDisplace, 0, 0, 0);
            return resultDate;
        }

        if (this._unit === RelativeTime.UNIT_WEEK) {
            const currentDayOfWeek = resultDate.getDay();
            const daysToDisplace = currentDayOfWeek + (this._fromNow === RelativeTime.FROM_NOW_THIS ? 0 : 7);
            resultDate.setHours(-24 * daysToDisplace, 0, 0, 0, 0);
            return resultDate;
        }

        if (this._unit === RelativeTime.UNIT_MONTH) {
            resultDate.setDate(1);
            resultDate.setHours(0, 0, 0, 0);
            if (this._fromNow === RelativeTime.FROM_NOW_LAST)
                resultDate.setMonth(resultDate.getMonth() - 1);
            return resultDate;
        }
    }
}

// constants
RelativeTime.FROM_NOW_THIS = 'this';
RelativeTime.FROM_NOW_LAST = 'last';

RelativeTime.UNIT_HOUR = 'hour';
RelativeTime.UNIT_DAY = 'day';
RelativeTime.UNIT_WEEK = 'week';
RelativeTime.UNIT_MONTH = 'month';

module.exports = RelativeTime;