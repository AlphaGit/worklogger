class RelativeTime {
    constructor(fromNow, unit) {
        if (fromNow !== RelativeTime.FROM_NOW_THIS && fromNow !== RelativeTime.FROM_NOW_LAST)
            throw new Error('Parameter required: fromNow.');

        if (unit !== RelativeTime.UNIT_HOUR
            && unit !== RelativeTime.UNIT_DAY
            && unit !== RelativeTime.UNIT_WEEK
            && unit !== RelativeTime.UNIT_MONTH)
            throw new Error('Parameter required: unit.');
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