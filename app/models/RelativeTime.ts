import moment from 'moment-timezone';

export class RelativeTime {
    private _fromNow: string;
    private _unit: string;
    private _timeZone: string;

    public static UNIT_HOUR = 'hour';
    public static UNIT_DAY = 'day';
    public static UNIT_WEEK = 'week';
    public static UNIT_MONTH = 'month';

    public static FROM_NOW_LAST = 'last';
    public static FROM_NOW_THIS = 'this';
    public static FROM_NOW_NEXT = 'next';

    _displacementMappings: {
        unit: string;
        fromNow: string;
        displacementFn: (dt: moment.Moment) => moment.Moment;
    }[];

    constructor(fromNow: string, unit: string, timeZone: string) {
        this._buildDisplacementMappings();

        this._validateFromNowValue(fromNow);
        this._validateUnitValue(unit);

        this._fromNow = fromNow;
        this._unit = unit;
        this._timeZone = timeZone;
    }

    _validateUnitValue(unit: string): void {
        const allowedValues = [
            RelativeTime.UNIT_HOUR,
            RelativeTime.UNIT_DAY,
            RelativeTime.UNIT_WEEK,
            RelativeTime.UNIT_MONTH,
        ];

        if (!allowedValues.includes(unit))
            throw new Error('Parameter required: unit.');
    }

    _validateFromNowValue(fromNow: string): void {
        const allowedValues = [
            RelativeTime.FROM_NOW_LAST,
            RelativeTime.FROM_NOW_THIS,
            RelativeTime.FROM_NOW_NEXT,
        ]

        if (!allowedValues.includes(fromNow))
            throw new Error('Parameter required: fromNow.');
    }

    _buildDisplacementMappings(): void {
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

    toDate(): Date {
        const displacementFn = this._displacementMappings
            .find(m => m.unit === this._unit && m.fromNow === this._fromNow)
            .displacementFn;

        const resultDate = moment.tz(this._timeZone);
        displacementFn(resultDate);
        return resultDate.toDate();
    }
}
