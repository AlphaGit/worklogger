export class AddTagDefinition {
    constructor(public name: string, public value?: string, public extractCaptureFromSummary?: string) {
        if (!name) throw new Error('name is required.');

        if (!value && !extractCaptureFromSummary) throw new Error('Either value or extractCaptureFromSummary are required.');

        if (value && extractCaptureFromSummary) throw new Error('Only one of value or extractCaptureFromSummary need to be provided.');
    }
}
