import { describe, test, expect } from "@jest/globals";

import { IApiResponse } from './IApiResponse';
import { Dates } from '../../../tests/entities';
import { ModelMapper } from './ModelMapper';

describe('map', () => {
    test('returns mapped events into worklogs', (): void => {
        const now = Dates.now();
        const twoHoursAgo = Dates.pastTwoHours();

        const items = [{
            calendarConfig: {
                id: 'testCalendarId',
                includeTags: ['tag1:value1', 'tag2:value2']
            },
            events: [{
                start: { dateTime: now.toISOString() },
                end: { dateTime: now.toISOString() },
                summary: 'Refinement meeting'
            }, {
                start: { dateTime: twoHoursAgo.toISOString() },
                end: { dateTime: now.toISOString() },
                summary: 'Stakeholder discussion'
            }]
        }, {
            calendarConfig: {
                id: 'calendarWithNoEvents',
                includeTags: ['tag3:value3', 'tag4:value4']
            }
        }] as IApiResponse[];

        const modelMapper = new ModelMapper();

        const worklogs = modelMapper.map(items);

        expect(worklogs.length).toBe(2);
        const [worklog1, worklog2] = worklogs;

        expect(worklog1.name).toBe('Refinement meeting');
        expect(worklog1.endDateTime).toStrictEqual(now);
        expect(worklog1.startDateTime).toStrictEqual(now);
        expect(worklog1.getDurationInMinutes()).toBe(0);
        expect(worklog1.getTagValue('tag1')).toBe('value1');
        expect(worklog1.getTagValue('tag2')).toBe('value2');

        expect(worklog2.name).toBe('Stakeholder discussion');
        expect(worklog2.endDateTime).toStrictEqual(now);
        expect(worklog2.startDateTime).toStrictEqual(twoHoursAgo);
        expect(worklog2.getDurationInMinutes()).toBe(120);
        expect(worklog2.getTagValue('tag1')).toBe('value1');
        expect(worklog2.getTagValue('tag2')).toBe('value2');
    });
});