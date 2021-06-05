import { Tag } from '.';

export class Worklog {
    public name: string;
    public startDateTime: Date;
    public endDateTime: Date;
    private _tags: Record<string, Tag>[] = {};

    constructor(name: string, startDateTime: Date, endDateTime: Date) {
        this._validateStartDateTime(startDateTime);
        this._validateEndDateTime(endDateTime);
        
        this.name = name;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }

    _validateEndDateTime(endDateTime: Date): void {
        if (!endDateTime) throw new Error('Missing endDateTime parameter');
        if (!(endDateTime instanceof Date)) throw new Error('endDateTime needs to be a Date.');
    }

    _validateStartDateTime(startDateTime: Date): void {
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!(startDateTime instanceof Date)) throw new Error('startDateTime needs to be a Date.');
    }

    getDurationInMinutes(): number {
        return Math.round((this.endDateTime.getTime() - this.startDateTime.getTime()) / (60 * 1000));
    } 

    toString(): string {
        let string = `${this.name || '(No name)'} (${this.getDurationInMinutes()} minutes)`;
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
        const hours = Math.floor(this.getDurationInMinutes() / 60);
        const minutes = this.getDurationInMinutes() % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours} hs`);
        if (minutes > 0) parts.push(`${minutes} mins`);
        return parts.join(' ');
    }

    /** @todo use the tag structure instead of deconstructing it */
    addTag(tag: Tag): void {
        this._tags[tag.name] = tag;
    }

    getTagValue(name: string): string {
        return this._tags[name]?.value;
    }
}