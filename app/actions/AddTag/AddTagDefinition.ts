export class AddTagDefinition {
    constructor(public name: string, public value?: string, public extractCaptureFromSummary?: string) {
        if (!name) throw new Error('name is required.');

        if (!value && !extractCaptureFromSummary) throw new Error('Either value or extractCaptureFromSummary are required.');
    }
}
