export interface IFileLoader {
    loadJson: (path: string) => Record<string, unknown>;
}
