import { getLogger } from 'log4js';

import { Worklog } from '../../models/Worklog';
import { AddTagConfiguration } from './AddTagConfiguration';
import { AddTagDefinition } from './AddTagDefinition';
import { IAction } from '../IAction';
import { Tag } from '../../models';

export class AddTagAction implements IAction {
    private _tagsToAdd: AddTagDefinition[];
    private _logger = getLogger();

    constructor(configuration: AddTagConfiguration) {
        if (Array.isArray(configuration.tagsToAdd) && !configuration.tagsToAdd.length)
            throw new Error('Configuration cannot be empty: tagsToAdd.');

        if (configuration.tagsToAdd.some(tag => !tag))
            throw new Error('Tags need to be valid tag-configuration objects.');

        this._tagsToAdd = configuration.tagsToAdd;
    }

    _extractCaptureFromSummary(summary: string, regexText?: string): string | undefined {
        try {
            if (!regexText) return undefined;

            const regex = new RegExp(regexText);
            const result = regex.exec(summary);
            if (!result) {
                this._logger.trace(`Could not extract /${regexText}/ from worklog summary "${summary}" (no matches).`);
                return undefined;
            }

            const matchedValue = result[1];
            this._logger.trace(`Extracted /${regexText}/ from worklog summary "${summary}" => ${matchedValue}`);
            return matchedValue;
        } catch (e) {
            this._logger.error(`Error while processing regex ${regexText} against text ${summary}`, e);
            return undefined;
        }
    }

    apply(worklog: Worklog): void {
        if (!(worklog instanceof Worklog))
            throw new Error('Apply: a Worklog is required.');

        this._tagsToAdd.forEach(tagToAdd => {
            const tagValue = tagToAdd.value || this._extractCaptureFromSummary(worklog.name, tagToAdd.extractCaptureFromSummary);
            const tag = new Tag(tagToAdd.name, tagValue ?? '');
            worklog.addTag(tag);
        });
    }

    toString(): string {
        const tags = this._tagsToAdd.map(t => `[${t.name}: ${t.value || `Regex(${t.extractCaptureFromSummary})`}]`)
        return `AddTags: ${tags.join(' ')}`;
    }
}