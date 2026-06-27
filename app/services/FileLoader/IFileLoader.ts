export interface IFileLoader {
    loadJson(filePath: string): Promise<Record<string, unknown>>;
}