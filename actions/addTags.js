const Worklog = require('models/Worklog');

module.exports = class AddTagsAction {
    constructor(configuration) {
        if (!configuration || !Array.isArray(configuration.tagsToAdd))
            throw new Error('Required configuration: tagsToAdd.');

        if (Array.isArray(configuration.tagsToAdd) && !configuration.tagsToAdd.length)
            throw new Error('Configuration cannot be empty: tagsToAdd.');

        if (configuration.tagsToAdd.some(tag => !this._validateTag(tag)))
            throw new Error('Tags need to have a name:value format.');

        this._tagsToAdd = configuration.tagsToAdd.map(tag => {
            const [tagName, tagValue] = tag.split(':', 2);
            return { tagName, tagValue };
        });
    }

    _validateTag(tagText) {
        const tagParts = tagText.split(':', 2);
        if (tagParts.length < 2) return false;
        if (tagParts.some(tp => !tp)) return false;
        return true;
    }

    apply(worklog) {
        if (!(worklog instanceof Worklog))
            throw new Error('Apply: a Worklog is required.');

        this._tagsToAdd.forEach(tag => {
            worklog.addTag(tag.tagName, tag.tagValue);
        });
    }
};