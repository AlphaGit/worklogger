export class Tag {
    constructor (public name: string, public value: string) {
        this.validateTagName(name);
    }

    private validateTagName(tagName: string): void {
        if (!tagName) throw new Error('Tag names cannot be empty');
    }
}
