import * as moment from "moment-timezone";

export enum Unit {
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month'
}

export enum FromNow {
    Last = 'last',
    This = 'this',
    Next = 'next'
}

export class RelativeTime {
    private _displacementMappings: {
        unit: string;
        fromNow: string;
        displacementFn: (dt: moment.Moment) => moment.Moment;
    }[];

    constructor(private fromNow: FromNow, private unit: Unit, private timeZone: string) {
        this.buildDisplacementMappings();
    }

    private buildDisplacementMappings(): void {
        const getMap = function buildDisplacementMapping(unit, fromNow, displacementFn) {
            return {
                unit,
                fromNow,
                displacementFn
            }
        }

        this._displacementMappings = [
            getMap(Unit.Hour, FromNow.Last, (dt) => dt.startOf('hour').subtract(1, 'hours')),
            getMap(Unit.Hour, FromNow.This, (dt) => dt.startOf('hour')),
            getMap(Unit.Hour, FromNow.Next, (dt) => dt.startOf('hour').add(1, 'hours')),

            getMap(Unit.Day, FromNow.Last, (dt) => dt.startOf('day').subtract(1, 'day')),
            getMap(Unit.Day, FromNow.This, (dt) => dt.startOf('day')),
            getMap(Unit.Day, FromNow.Next, (dt) => dt.startOf('day').add(1, 'day')),

            getMap(Unit.Week, FromNow.Last, (dt) => dt.startOf('week').subtract(1, 'week')),
            getMap(Unit.Week, FromNow.This, (dt) => dt.startOf('week')),
            getMap(Unit.Week, FromNow.Next, (dt) => dt.startOf('week').add(1, 'week')),

            getMap(Unit.Month, FromNow.Last, (dt) => dt.startOf('month').subtract(1, 'month')),
            getMap(Unit.Month, FromNow.This, (dt) => dt.startOf('month')),
            getMap(Unit.Month, FromNow.Next, (dt) => dt.startOf('month').add(1, 'month')),
        ];
    }

    toDate(): Date {
        const displacementFn = this._displacementMappings
            .find(m => m.unit === this.unit && m.fromNow === this.fromNow)
            .displacementFn;

        const resultDate = moment.tz(this.timeZone);
        displacementFn(resultDate);
        return resultDate.toDate();
    }
}
