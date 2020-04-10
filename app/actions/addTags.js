const Worklog = require('app/models/Worklog');
const logger = require('app/services/loggerFactory').getLogger('actions/addTags');

module.exports = class AddTagsAction {
    constructor(configuration) {
        if (!configuration || !Array.isArray(configuration.tagsToAdd))
            throw new Error('Required configuration: tagsToAdd.');

        if (Array.isArray(configuration.tagsToAdd) && !configuration.tagsToAdd.length)
            throw new Error('Configuration cannot be empty: tagsToAdd.');

        if (configuration.tagsToAdd.some(tag => !this._validateTagObject(tag)))
            throw new Error('Tags need to be valid tag-configuration objects.');

        this._tagsToAdd = configuration.tagsToAdd;
    }

    _validateTagObject(tagObject) {
        if (!tagObject) return false;
        if (!(typeof(tagObject) === 'object')) return false;

        if (!tagObject.name) return false;
        if (!tagObject.value && !tagObject.extractCaptureFromSummary) return false;

        return true;
    }

    _extractCaptureFromSummary(summary, regexText) {
        try {
            const regex = new RegExp(regexText);
            const result = regex.exec(summary);
            if (!result) {
                logger.trace(`Could not extract /${regexText}/ from worklog summary "${summary}" (no matches).`);
                return undefined;
            }

            const matchedValue = result[1];
            logger.trace(`Extracted /${regexText}/ from worklog summary "${summary}" => ${matchedValue}`);
            return matchedValue;
        } catch (e) {
            logger.error(`Error while processing regex ${regexText} against text ${summary}`, e);
            return undefined;
        }
    }

    apply(worklog) {
        if (!(worklog instanceof Worklog))
            throw new Error('Apply: a Worklog is required.');

        this._tagsToAdd.forEach(tag => {
            const tagValue = tag.value || this._extractCaptureFromSummary(worklog.name, tag.extractCaptureFromSummary);
            worklog.addTag(tag.name, tagValue);
        });
    }

    toString() {
        const tags = this._tagsToAdd.map(t => `[${t.name}: ${t.value || `Regex(${t.extractCaptureFromSummary})`}]`)
        return `AddTags: ${tags.join(' ')}`;
    }
};