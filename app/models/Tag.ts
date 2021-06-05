export class Tag {
    constructor (public name: string, public value: string) {
        this.validateTagName(name);
    }

    private validateTagName(tagName: string): void {
        if (tagName == null || tagName == undefined) throw new Error('Tag names cannot be empty');
        if (typeof(tagName) !== 'string') throw new Error('Tag names need to be strings');
    }
}
