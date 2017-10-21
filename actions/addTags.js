const Worklog = require('models/Worklog');

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
        if (!tagObject.value) return false;

        return true;
    }

    apply(worklog) {
        if (!(worklog instanceof Worklog))
            throw new Error('Apply: a Worklog is required.');

        this._tagsToAdd.forEach(tag => {
            worklog.addTag(tag.name, tag.value);
        });
    }
};