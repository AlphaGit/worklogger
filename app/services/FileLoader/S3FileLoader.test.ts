import { PassThrough } from 'stream';

afterEach(() => {
    jest.resetAllMocks();
});

describe('loadJson', () => {
    test('return data from S3', async () => {
        const mockedBodyStream = new PassThrough();
        const getObjectMock = jest.fn().mockResolvedValue({
            Body: mockedBodyStream
        });

        jest.doMock('@aws-sdk/client-s3', () => ({
            S3: () => ({
                getObject: getObjectMock
            })
        }));

        await import('./S3FileLoader').then(async module => {
            const s3fileLoader = new module.S3FileLoader('bucketName');
            const jsonPromise = s3fileLoader.loadJson('fileName.txt');
            mockedBodyStream.push('{"a": 1}');
            mockedBodyStream.end();
            const json = await jsonPromise;

            expect(json).toEqual({ a: 1 });
            expect(getObjectMock).toBeCalledWith({ Bucket: 'bucketName', Key: 'fileName.txt' });    
        });
    });

    test('rejects if cannot return data', async () => {
        jest.doMock('@aws-sdk/client-s3', () => ({
            S3: () => ({
                getObject: jest.fn().mockRejectedValue('S3Error')
            })
        }));

        await import('./S3FileLoader').then(async module => {
            const s3fileLoader = new module.S3FileLoader('bucketName');
            await expect(async () => await s3fileLoader.loadJson('fileName.txt')).rejects.toThrow();
        });
    });
});