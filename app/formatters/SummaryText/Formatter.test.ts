import { beforeEach, describe, test, expect } from "@jest/globals";

import { SummaryTextFormatter } from './Formatter';
import { Worklog } from '../../models/Worklog';
import { Tag } from '../../models/Tag';
import { SummaryTextFormatterConfiguration } from './SummaryTextFormatterConfiguration';
import { AppConfigurations, WorklogSets, Worklogs } from '../../../tests/entities';

describe('SummaryTextFormatter', () => {
    let formatter: SummaryTextFormatter;
    const mockConfig = new SummaryTextFormatterConfiguration([['project'], ['type']]);

    beforeEach(() => {
        formatter = new SummaryTextFormatter(mockConfig, AppConfigurations.normal());
    });

    describe('format', () => {
        test('should format worklog set with correct date range and total time', async () => {
            const worklogSet = WorklogSets.double();

            const result = await formatter.format(worklogSet);
            
            expect(result).toContain('Worklogs from');
            expect(result).toContain('Total time:');
        });

        test('should throw error when worklogSet is invalid', async () => {
            await expect(formatter.format(null as any)).rejects.toThrow('Missing WorklogSet.');
        });
    });

    describe('_getWorklogDurationSumInMinutes', () => {
        test('should correctly sum durations of multiple worklogs', () => {
            const worklogs = [
                Worklogs.normal(),
                Worklogs.normal2(),
                Worklogs.noDuration()
            ];

            const result = formatter._getWorklogDurationSumInMinutes(worklogs);
            expect(result).toBeGreaterThan(0);
        });

        test('should return 0 for empty worklog array', () => {
            const result = formatter._getWorklogDurationSumInMinutes([]);
            expect(result).toBe(0);
        });
    });

    describe('_getTotalHsMsString', () => {
        test('should format hours and minutes correctly', () => {
            expect(formatter._getTotalHsMsString(90)).toBe('1hs 30m');
            expect(formatter._getTotalHsMsString(45)).toBe('0hs 45m');
            expect(formatter._getTotalHsMsString(150)).toBe('2hs 30m');
        });
    });

    describe('_generateAggregations', () => {
        test('should generate correct aggregations based on tags', () => {
            const worklogSet = WorklogSets.double();
            worklogSet.worklogs.forEach(w => {
                w.addTag(new Tag('type', 'Development'));
            });

            const result = formatter._generateAggregations(worklogSet);
            expect(result).toHaveLength(2); // Two aggregation groups
            expect(result[0][0]).toBe('Total time by project: (excluding non-tagged: 0hs 0m)');
            expect(result[1][0]).toBe('Total time by type: (excluding non-tagged: 0hs 0m)');
        });

        test('should exclude worklogs without the specified tag from summarization and show them in non-tagged time', () => {
            const worklogSet = WorklogSets.mixed();
            worklogSet.worklogs[0].addTag(new Tag('project', 'Project A')); // Only project tag
            worklogSet.worklogs[1].addTag(new Tag('type', 'Testing')); // Only type tag
            worklogSet.worklogs[2].addTag(new Tag('project', 'Project B')); // Only project tag
            worklogSet.worklogs[2].addTag(new Tag('type', 'Development')); // And type tag

            const result = formatter._generateAggregations(worklogSet);
            
            // Project aggregation should show worklogs[1] as non-tagged
            const projectAggregation = result[0].join('\n');
            expect(projectAggregation).toContain('Project A:');
            expect(projectAggregation).toContain('Project B:');
            expect(projectAggregation).toMatch(/Total time by project: \(excluding non-tagged: \d+hs \d+m\)/);
            
            // Type aggregation should show worklogs[0] and part of worklogs[2] as non-tagged
            const typeAggregation = result[1].join('\n');
            expect(typeAggregation).toContain('Testing:');
            expect(typeAggregation).toContain('Development:');
            expect(typeAggregation).toMatch(/Total time by type: \(excluding non-tagged: \d+hs \d+m\)/);
        });

        test('should include worklogs in multiple tag summarizations and track non-tagged time separately', () => {
            formatter = new SummaryTextFormatter(new SummaryTextFormatterConfiguration([['project'], ['type'], ['priority']]), AppConfigurations.normal());
            
            const worklogSet = WorklogSets.double();
            // First worklog has all tags
            worklogSet.worklogs[0].addTag(new Tag('project', 'Project A'));
            worklogSet.worklogs[0].addTag(new Tag('type', 'Development'));
            worklogSet.worklogs[0].addTag(new Tag('priority', 'High'));
            // Second worklog has only project and priority
            worklogSet.worklogs[1].addTag(new Tag('project', 'Project A'));
            worklogSet.worklogs[1].addTag(new Tag('priority', 'Low'));

            const result = formatter._generateAggregations(worklogSet);
            expect(result).toHaveLength(3); // Three aggregation groups

            // Project aggregation should have no non-tagged time
            const projectAggregation = result[0].join('\n');
            expect(projectAggregation).toContain('Project A:');
            expect(projectAggregation).toContain('(excluding non-tagged: 0hs 0m)');

            // Type aggregation should show second worklog as non-tagged
            const typeAggregation = result[1].join('\n');
            expect(typeAggregation).toContain('Development:');
            expect(typeAggregation).toMatch(/Total time by type: \(excluding non-tagged: \d+hs \d+m\)/);

            // Priority aggregation should have no non-tagged time
            const priorityAggregation = result[2].join('\n');
            expect(priorityAggregation).toContain('High:');
            expect(priorityAggregation).toContain('Low:');
            expect(priorityAggregation).toContain('(excluding non-tagged: 0hs 0m)');
        });

        test('should return empty array when no aggregation tags configured', () => {
            const worklogSet = WorklogSets.empty();
            formatter = new SummaryTextFormatter(new SummaryTextFormatterConfiguration([]), AppConfigurations.normal());

            const result = formatter._generateAggregations(worklogSet);
            expect(result).toHaveLength(0);
        });
    });

    // Helper functions to create mock worklogs
    function createMockWorklog(description: string, startDateTime: Date, endDateTime: Date): Worklog {
        return new Worklog(description, startDateTime, endDateTime);
    }

    function createMockWorklogWithTags(description: string, startDateTime: Date, endDateTime: Date, tags: Record<string, string>): Worklog {
        const worklog = createMockWorklog(description, startDateTime, endDateTime);
        Object.entries(tags).forEach(([key, value]) => {
            worklog.addTag(new Tag(key, value));
        });
        return worklog;
    }
}); 