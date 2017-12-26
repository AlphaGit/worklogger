class Worklog {
    constructor(name, startDateTime, endDateTime,
        duration = (endDateTime - startDateTime) / (60 * 1000) // duration in minutes
    ) {
        this._validateName(name);
        this._validateStartDateTime(startDateTime);
        this._validateEndDateTime(endDateTime);
        
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.duration = duration;

        this._tags = {};
    }

    _validateEndDateTime(endDateTime) {
        if (!endDateTime) throw new Error('Missing endDateTime parameter');
        if (!(endDateTime instanceof Date)) throw new Error('endDateTime needs to be a Date.');
    }

    _validateStartDateTime(startDateTime) {
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!(startDateTime instanceof Date)) throw new Error('startDateTime needs to be a Date.');
    }

    _validateName(name) {
        if (!name) throw new Error('Missing name parameter');
    }

    toString() {
        let string = `${this.name} (${this.duration} minutes)`;
        for (let tagName in this._tags) {
            const tagValue = this._tags[tagName];
            string += `\n    ${tagName}:${tagValue}`;
        }
        return string;
    }

    toOneLinerString() {
        let string = `(${this.getShortDuration()}) ${this.name}`;
        for (let tagName in this._tags) {
            const tagValue = this._tags[tagName];
            string += ` [${tagName}:${tagValue}]`;
        }
        return string;
    }

    getShortDuration() {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours} hs`);
        if (minutes > 0) parts.push(`${minutes} mins`);
        return parts.join(' ');
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
        if (tagName == null || tagName == undefined) throw new Error('Tag names cannot be empty');
        if (typeof(tagName) !== 'string') throw new Error('Tag names need to be strings');
    }
}

module.exports = Worklog;
