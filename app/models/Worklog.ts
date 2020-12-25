export class Worklog {
    name: string;
    startDateTime: Date;
    endDateTime: Date;
    duration: number;
    private _tags: Record<string,string>;

    constructor(name: string, startDateTime: Date, endDateTime: Date,
        duration: number = (endDateTime.getTime() - startDateTime.getTime()) / (60 * 1000) // duration in minutes
    ) {
        this._validateStartDateTime(startDateTime);
        this._validateEndDateTime(endDateTime);
        
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
        this.duration = duration;

        this._tags = {};
    }

    _validateEndDateTime(endDateTime: Date): void {
        if (!endDateTime) throw new Error('Missing endDateTime parameter');
        if (!(endDateTime instanceof Date)) throw new Error('endDateTime needs to be a Date.');
    }

    _validateStartDateTime(startDateTime: Date): void {
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!(startDateTime instanceof Date)) throw new Error('startDateTime needs to be a Date.');
    }

    toString(): string {
        let string = `${this.name || '(No name)'} (${this.duration} minutes)`;
        for (const tagName in this._tags) {
            const tagValue = this._tags[tagName];
            string += `\n    ${tagName}:${tagValue}`;
        }
        return string;
    }

    toOneLinerString(): string {
        let string = `(${this.getShortDuration()}) ${this.name}`;
        for (const tagName in this._tags) {
            const tagValue = this._tags[tagName];
            string += ` [${tagName}:${tagValue}]`;
        }
        return string;
    }

    getShortDuration(): string {
        const hours = Math.floor(this.duration / 60);
        const minutes = this.duration % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours} hs`);
        if (minutes > 0) parts.push(`${minutes} mins`);
        return parts.join(' ');
    }

    addTag(name: string, value: string): void {
        this._validateTagName(name);
        this._tags[name] = value;
    }

    getTagValue(name: string): string {
        this._validateTagName(name);
        return this._tags[name];
    }

    _validateTagName(tagName: string): void {
        if (tagName == null || tagName == undefined) throw new Error('Tag names cannot be empty');
        if (typeof(tagName) !== 'string') throw new Error('Tag names need to be strings');
    }
}