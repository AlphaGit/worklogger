import { JiraWorklog } from '.';

describe('constructor', () => {
    test('requires a comment', () => {
        expect(() => new JiraWorklog(null, '2021-05-01T08:00:00-0500', '2h')).toThrow('Worklog requires comment field.');
        expect(() => new JiraWorklog(undefined, '2021-05-01T08:00:00-0500', '2h')).toThrow('Worklog requires comment field.');
        expect(() => new JiraWorklog('', '2021-05-01T08:00:00-0500', '2h')).toThrow('Worklog requires comment field.');
    });

    test('requires a started field', () => {
        expect(() => new JiraWorklog('comment', null, '2h')).toThrow('Worklog requires started field.');
        expect(() => new JiraWorklog('comment', undefined, '2h')).toThrow('Worklog requires started field.');
        expect(() => new JiraWorklog('comment', '', '2h')).toThrow('Worklog requires started field.');
    });

    test('requires a timeSpent field', () => {
        expect(() => new JiraWorklog('comment', '2021-05-01T08:00:00-050', null)).toThrow('Worklog requires timeSpent field.');
        expect(() => new JiraWorklog('comment', '2021-05-01T08:00:00-050', undefined)).toThrow('Worklog requires timeSpent field.');
        expect(() => new JiraWorklog('comment', '2021-05-01T08:00:00-050', '')).toThrow('Worklog requires timeSpent field.');
    });
})