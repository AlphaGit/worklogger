import { Tag } from '.';

export class Worklog {
    private tags: Map<string, Tag> = new Map();

    constructor(public name: string, public startDateTime: Date, public endDateTime: Date) {
        if (!startDateTime) throw new Error('Missing startDateTime parameter');
        if (!endDateTime) throw new Error('Missing endDateTime parameter');
    }

    getDurationInMinutes(): number {
        return Math.round((this.endDateTime.getTime() - this.startDateTime.getTime()) / (60 * 1000));
    } 

    toString(): string {
        let string = `${this.name || '(No name)'} (${this.getDurationInMinutes()} minutes)`;
        for (const tagName of this.getTagKeys()) {
            const tagValue = this.getTagValue(tagName);
            string += `\n    ${tagName}:${tagValue}`;
        }
        return string;
    }

    toOneLinerString(): string {
        let string = `(${this.getShortDuration()}) ${this.name || '(No name)'}`;
        for (const tagName of this.getTagKeys()) {
            const tagValue = this.getTagValue(tagName);
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
        this.tags.set(tag.name, tag);
    }

    removeTag(tagName: string): void {
        this.tags.delete(tagName);
    }

    getTagValue(name: string): string {
        return this.tags.get(name)?.value;
    }

    getTagKeys(): string[] {
        return Array.from(this.tags.keys());
    }
}