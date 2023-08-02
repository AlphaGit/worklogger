export type OutputConfiguration = {
    type: string;
    name: string;
    storageRelativePath: string;
}
export class OutputConfiguration {
    constructor(outputConfiguration: OutputConfiguration) {
        this.name = outputConfiguration.name;
    }
}