import { LocalFileLoader } from "./LocalFileLoader";

const resolveMock = jest.fn();
jest.mock('path', () => ({
    resolve: () => resolveMock
}));
describe('loadJson', () => {
    test('loads the file specified through a relative path', async () => {
        jest.mock('subDir/filePath.txt', () => ({
            a: () => ({})
        }), { virtual: true });

        const localFileLoader = new LocalFileLoader();
        const resolvedFile = await localFileLoader.loadJson('subDir/filePath.txt');
        expect(resolvedFile.a).toBeTruthy();
    });

    test('rejects if the module cannot be found', async () => {
        jest.mock('filePath.json', () => {
            throw new Error('error');
        }, { virtual: true });

        const localFileLoader = new LocalFileLoader();
        await expect(async () => await localFileLoader.loadJson('filePath.json')).rejects.toThrow('error');
    });
});