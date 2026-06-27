import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { IFileLoader } from './IFileLoader';
import { getLogger, LoggerCategory } from '../Logger';
import { Readable } from 'stream';

const logger = getLogger(LoggerCategory.Services);

export class S3FileLoader implements IFileLoader {
    private s3Bucket: string;

    constructor(s3Bucket: string) {
        this.s3Bucket = s3Bucket;
    }

    async loadJson(filePath: string): Promise<Record<string, unknown>> {
        const requestParams = {
            Bucket: this.s3Bucket,
            Key: filePath
        };

        logger.info(`Loading from S3 bucket: ${requestParams.Bucket}/${requestParams.Key}`)

        try {
            const s3 = new S3Client({ });
            const data = await s3.send(new GetObjectCommand(requestParams));
            const json = await this.streamToString(data.Body as Readable);

            if (!json) throw new Error(`Did not receive any data from ${requestParams.Bucket}/${requestParams.Key}`);

            return JSON.parse(json);
        } catch (err) {
            logger.error(`Error while retrieving ${requestParams.Bucket}/${requestParams.Key}`, err);
            throw err;
        }
    }

    async saveFile(filePath: string, fileContents: string): Promise<void> {
        const requestParams = {
            Bucket: this.s3Bucket,
            Key: filePath,
            Body: fileContents
        };

        logger.info(`Saving to S3 bucket: ${requestParams.Bucket}/${requestParams.Key}`)

        try {
            const s3 = new S3Client({ });
            await s3.send(new PutObjectCommand(requestParams));
        } catch (err) {
            logger.error(`Error while saving ${requestParams.Bucket}/${requestParams.Key}`, err);
            throw err;
        }
    }

    private async streamToString(stream: Readable): Promise<string> {
        return new Promise((resolve, reject) => {
            const chunks: string[] = [];

            stream.on('data', chunk => chunks.push(chunk.toString()));
            stream.once('end', () => resolve(chunks.join('')));
            stream.once('error', reject);
        });
    }
}
