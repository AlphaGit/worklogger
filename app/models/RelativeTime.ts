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

type DisplacementMapping = {
    unit: string;
    fromNow: string;
    displacementFn: (dt: moment.Moment) => moment.Moment;
};

export class RelativeTime {
    private _displacementMappings: DisplacementMapping[] = this.buildDisplacementMappings() || [];

    constructor(private fromNow: FromNow, private unit: Unit, private timeZone: string) {
        this.buildDisplacementMappings();
    }

    private buildDisplacementMappings(): DisplacementMapping[] {
        const getMap = function buildDisplacementMapping(unit: string, fromNow: string, displacementFn: (dt: moment.Moment) => moment.Moment) {
            return {
                unit,
                fromNow,
                displacementFn
            }
        }

        return [
            getMap(Unit.Hour, FromNow.Last, (dt: moment.Moment) => dt.startOf('hour').subtract(1, 'hours')),
            getMap(Unit.Hour, FromNow.This, (dt: moment.Moment) => dt.startOf('hour')),
            getMap(Unit.Hour, FromNow.Next, (dt: moment.Moment) => dt.startOf('hour').add(1, 'hours')),

            getMap(Unit.Day, FromNow.Last, (dt: moment.Moment) => dt.startOf('day').subtract(1, 'day')),
            getMap(Unit.Day, FromNow.This, (dt: moment.Moment) => dt.startOf('day')),
            getMap(Unit.Day, FromNow.Next, (dt: moment.Moment) => dt.startOf('day').add(1, 'day')),

            getMap(Unit.Week, FromNow.Last, (dt: moment.Moment) => dt.startOf('week').subtract(1, 'week')),
            getMap(Unit.Week, FromNow.This, (dt: moment.Moment) => dt.startOf('week')),
            getMap(Unit.Week, FromNow.Next, (dt: moment.Moment) => dt.startOf('week').add(1, 'week')),

            getMap(Unit.Month, FromNow.Last, (dt: moment.Moment) => dt.startOf('month').subtract(1, 'month')),
            getMap(Unit.Month, FromNow.This, (dt: moment.Moment) => dt.startOf('month')),
            getMap(Unit.Month, FromNow.Next, (dt: moment.Moment) => dt.startOf('month').add(1, 'month')),
        ];
    }

    toDate(): Date {
        const displacementFn = this?._displacementMappings
            .find(m => m.unit === this.unit && m.fromNow === this.fromNow)
            ?.displacementFn
            ?? ((dt) => dt);

        const resultDate = moment.tz(this.timeZone);
        displacementFn(resultDate);
        return resultDate.toDate();
    }
}
