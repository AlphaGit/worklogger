class Worklog {
    constructor(name, startDateTime, endDateTime,
        duration = (endDateTime - startDateTime) / (60 * 1000) // duration in minutes
    ) {
        if (!name) throw new Error('Missing name parameter');
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!endDateTime) throw new Error('Missing endDateTime parameter');

        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.duration = duration;

        this._tags = {};
    }

    toString() {
        let string = `${this.name} (${this.duration} minutes)`;
        for (let tagName in this._tags) {
            const tagValue = this._tags[tagName];
            string += `\n    ${tagName}:${tagValue}`;
        }
        return string;
    }

    addTag(name, value) {
        this._validateTagName(name);

        this._tags[name] = value;
    }

    getTagValue(name) {
        this._validateTagName(name);

        return this._tags[name];
    }

    _validateTagName(tagName) {
        if (tagName == null || tagName == undefined)
            throw new Error('Tag names cannot be empty');
        else if (typeof(tagName) !== 'string')
            throw new Error('Tag names need to be strings');
    }
}

module.exports = Worklog;
