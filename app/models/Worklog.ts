import { Tag } from '.';

export class Worklog {
    private tags: Record<string, Tag> = {};

    constructor(public name: string, public startDateTime: Date, public endDateTime: Date) {
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!endDateTime) throw new Error('Missing endDateTime parameter');
    }

    getDurationInMinutes(): number {
        return Math.round((this.endDateTime.getTime() - this.startDateTime.getTime()) / (60 * 1000));
    } 

    toString(): string {
        let string = `${this.name || '(No name)'} (${this.getDurationInMinutes()} minutes)`;
        for (const tagName in this.tags) {
            const tagValue = this.tags[tagName].value;
            string += `\n    ${tagName}:${tagValue}`;
        }
        return string;
    }

    toOneLinerString(): string {
        let string = `(${this.getShortDuration()}) ${this.name || '(No name)'}`;
        for (const tagName in this.tags) {
            const tagValue = this.tags[tagName].value;
            string += ` [${tagName}:${tagValue}]`;
        }
        return string;
    }

    getShortDuration(): string {
        const durationInMinutes = this.getDurationInMinutes();
        const hours = Math.floor(durationInMinutes / 60);
        const minutes = durationInMinutes % 60;

        return `${hours}h ${minutes}m`
    }

    addTag(tag: Tag): void {
        this.tags[tag.name] = tag;
    }

    removeTag(tagName: string): void {
        delete this.tags[tagName];
    }

    getTagValue(name: string): string {
        return this.tags[name]?.value;
    }

    getTagKeys(): string[] {
        return Object.keys(this.tags);
    }
}