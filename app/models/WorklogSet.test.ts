import { WorklogSet } from ".";
import { Worklogs, WorklogSets } from '../../tests/entities';

describe('constructor', () => {
    test('requires startDateTime', () => {
        expect(() => new WorklogSet(null, new Date(), [Worklogs.normal()])).toThrow('Missing date parameter: startDateTime');
        expect(() => new WorklogSet(undefined, new Date(), [Worklogs.normal()])).toThrow('Missing date parameter: startDateTime');
    });

    test('requires endDateTime', () => {
        expect(() => new WorklogSet(new Date(), null, [Worklogs.normal()])).toThrow('Missing date parameter: endDateTime');
        expect(() => new WorklogSet(new Date(), undefined, [Worklogs.normal()])).toThrow('Missing date parameter: endDateTime');
    });
});

describe('getFilteredCopy', () => {
    test('filters worklogs', () => {
        const originalSet = WorklogSets.double();
        originalSet.worklogs[0].name = 'name1';
        originalSet.worklogs[1].name = 'name2';

        const filtered1 = originalSet.getFilteredCopy(w => w.name.includes('1'));
        expect(filtered1.worklogs.length).toBe(1);
        expect(filtered1.startDateTime).toBe(originalSet.startDateTime);
        expect(filtered1.endDateTime).toBe(originalSet.endDateTime);
        
        const filtered2 = originalSet.getFilteredCopy(w => !!w.getTagValue('non-existent-tag'));
        expect(filtered2.worklogs.length).toBe(0);
    });
});