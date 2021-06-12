import { Worklog, Tag } from ".";
import { Tags } from '../../tests/entities';

describe('constructor', () => {
    test('requires a startDateTime', () => {
        expect(() => new Worklog('name', null, new Date())).toThrow('Missing startDateTime parameter');
        expect(() => new Worklog('name', undefined, new Date())).toThrow('Missing startDateTime parameter');
    });

    test('requires an endDateTime', () => {
        expect(() => new Worklog('name', new Date(), null)).toThrow('Missing endDateTime parameter');
        expect(() => new Worklog('name', new Date(), undefined)).toThrow('Missing endDateTime parameter');
    });
});

describe('getDurationInMinutes', () => {
    test('returns duration', () => {
        const worklog = new Worklog('name', new Date('2021-01-01T01:02:03'), new Date('2021-01-01T01:02:03'));
        expect(worklog.getDurationInMinutes()).toBe(0);

        worklog.startDateTime = new Date('2021-01-01T01:00:00');
        expect(worklog.getDurationInMinutes()).toBe(2);

        worklog.endDateTime = new Date('2021-01-01T01:00:31');
        expect(worklog.getDurationInMinutes()).toBe(1);

        worklog.endDateTime = new Date('2021-01-01T01:59:31');
        expect(worklog.getDurationInMinutes()).toBe(60);

        worklog.endDateTime = new Date('2021-01-01T03:25:31');
        expect(worklog.getDurationInMinutes()).toBe(146);
    });
});

describe('getShortDuration', () => {
    test('returns duration', () => {
        const worklog = new Worklog('name', new Date('2021-01-01T01:02:03'), new Date('2021-01-01T01:02:03'));
        expect(worklog.getShortDuration()).toBe('0h 0m');

        worklog.startDateTime = new Date('2021-01-01T01:00:00');
        expect(worklog.getShortDuration()).toBe('0h 2m');

        worklog.endDateTime = new Date('2021-01-01T01:00:31');
        expect(worklog.getShortDuration()).toBe('0h 1m');

        worklog.endDateTime = new Date('2021-01-01T01:59:31');
        expect(worklog.getShortDuration()).toBe('1h 0m');

        worklog.endDateTime = new Date('2021-01-01T03:25:31');
        expect(worklog.getShortDuration()).toBe('2h 26m');
    });
});

describe('toOneLiner', () => {
    test('returns description', () => {
        const worklog = new Worklog('Important meeting', new Date('2021-01-01T01:02:03'), new Date('2021-01-01T01:02:03'));
        worklog.addTag(Tags.client.ProCorp());
        worklog.addTag(Tags.project.TestPlatform());

        expect(worklog.toOneLinerString()).toBe('(0h 0m) Important meeting [client:ProCorp] [project:Test Platform]');

        worklog.startDateTime = new Date('2021-01-01T01:00:00');
        expect(worklog.toOneLinerString()).toBe('(0h 2m) Important meeting [client:ProCorp] [project:Test Platform]');

        worklog.endDateTime = new Date('2021-01-01T01:00:31');
        expect(worklog.toOneLinerString()).toBe('(0h 1m) Important meeting [client:ProCorp] [project:Test Platform]');

        worklog.endDateTime = new Date('2021-01-01T01:59:31');
        expect(worklog.toOneLinerString()).toBe('(1h 0m) Important meeting [client:ProCorp] [project:Test Platform]');

        worklog.endDateTime = new Date('2021-01-01T03:25:31');
        expect(worklog.toOneLinerString()).toBe('(2h 26m) Important meeting [client:ProCorp] [project:Test Platform]');

        worklog.name = '';
        expect(worklog.toOneLinerString()).toBe('(2h 26m) (No name) [client:ProCorp] [project:Test Platform]');
    });
});

describe('toString', () => {
    test('returns description', () => {
        const worklog = new Worklog('Important meeting', new Date('2021-01-01T01:02:03'), new Date('2021-01-01T01:02:03'));
        worklog.addTag(Tags.client.ProCorp());
        worklog.addTag(Tags.project.TestPlatform());

        expect(worklog.toString()).toBe('Important meeting (0 minutes)\n    client:ProCorp\n    project:Test Platform');

        worklog.startDateTime = new Date('2021-01-01T01:00:00');
        expect(worklog.toString()).toBe('Important meeting (2 minutes)\n    client:ProCorp\n    project:Test Platform');

        worklog.endDateTime = new Date('2021-01-01T01:00:31');
        expect(worklog.toString()).toBe('Important meeting (1 minutes)\n    client:ProCorp\n    project:Test Platform');

        worklog.endDateTime = new Date('2021-01-01T01:59:31');
        expect(worklog.toString()).toBe('Important meeting (60 minutes)\n    client:ProCorp\n    project:Test Platform');

        worklog.endDateTime = new Date('2021-01-01T03:25:31');
        expect(worklog.toString()).toBe('Important meeting (146 minutes)\n    client:ProCorp\n    project:Test Platform');

        worklog.name = '';
        expect(worklog.toString()).toBe('(No name) (146 minutes)\n    client:ProCorp\n    project:Test Platform');
    });
});