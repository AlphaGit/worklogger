import { beforeAll, afterAll, describe, test, expect } from "@jest/globals";

import { RelativeTime, FromNow, Unit } from "./RelativeTime";

beforeAll(() => {
    const baseTime = new Date('2021-02-03T04:05:06-0800').getTime();
    jest.spyOn(Date, 'now').mockReturnValue(baseTime);
});

afterAll(() => {
    jest.spyOn(Date, 'now').mockRestore();
});

describe('toDate', () => {
    test('correctly guesses LAST HOUR', () => {
        const expectedDate = new Date('2021-02-03T03:00:00-0800');
        expect(new RelativeTime(FromNow.Last, Unit.Hour, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses THIS HOUR', () => {
        const expectedDate = new Date('2021-02-03T04:00:00-0800');
        expect(new RelativeTime(FromNow.This, Unit.Hour, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses NEXT HOUR', () => {
        const expectedDate = new Date('2021-02-03T05:00:00-0800');
        expect(new RelativeTime(FromNow.Next, Unit.Hour, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses LAST DAY', () => {
        const expectedDate = new Date('2021-02-02T00:00:00-0800');
        expect(new RelativeTime(FromNow.Last, Unit.Day, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses THIS DAY', () => {
        const expectedDate = new Date('2021-02-03T00:00:00-0800');
        expect(new RelativeTime(FromNow.This, Unit.Day, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses NEXT DAY', () => {
        const expectedDate = new Date('2021-02-04T00:00:00-0800');
        expect(new RelativeTime(FromNow.Next, Unit.Day, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses LAST WEEK', () => {
        const expectedDate = new Date('2021-01-24T00:00:00-0800');
        expect(new RelativeTime(FromNow.Last, Unit.Week, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses THIS WEEK', () => {
        const expectedDate = new Date('2021-01-31T00:00:00-0800');
        expect(new RelativeTime(FromNow.This, Unit.Week, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses NEXT WEEK', () => {
        const expectedDate = new Date('2021-02-07T00:00:00-0800');
        expect(new RelativeTime(FromNow.Next, Unit.Week, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses LAST MONTH', () => {
        const expectedDate = new Date('2021-01-01T00:00:00-0800');
        expect(new RelativeTime(FromNow.Last, Unit.Month, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses THIS MONTH', () => {
        const expectedDate = new Date('2021-02-01T00:00:00-0800');
        expect(new RelativeTime(FromNow.This, Unit.Month, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });

    test('correctly guesses NEXT MONTH', () => {
        const expectedDate = new Date('2021-03-01T00:00:00-0800');
        expect(new RelativeTime(FromNow.Next, Unit.Month, 'America/Vancouver').toDate()).toStrictEqual(expectedDate);
    });
});