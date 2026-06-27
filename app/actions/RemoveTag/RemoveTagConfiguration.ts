export class RemoveTagConfiguration {
    constructor(public tagName: string) {
        if (!tagName) throw new Error('tagName is required.');
    }
}
