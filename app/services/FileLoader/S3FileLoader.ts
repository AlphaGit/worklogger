import { S3 } from '@aws-sdk/client-s3';
import { IFileLoader } from './IFileLoader';
import { getLogger } from 'log4js';
import { Readable } from 'stream';

const logger = getLogger('services/FileLoader/S3FileLoader');

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
            const s3 = new S3({ });
            const data = await s3.getObject(requestParams);
            const json = await this.streamToString(data.Body as Readable);

            if (!json) throw new Error(`Did not receive any data from ${requestParams.Bucket}/${requestParams.Key}`);

            return JSON.parse(json);
        } catch (err) {
            logger.error(`Error while retrieving ${requestParams.Bucket}/${requestParams.Key}`, err);
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
