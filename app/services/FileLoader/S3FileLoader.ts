import { LoggerFactory } from '../LoggerFactory';
import { S3 } from '@aws-sdk/client-s3';
import { IFileLoader } from './IFileLoader';

const logger = LoggerFactory.getLogger('services/FileLoader/S3FileLoader');

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
            const json = data.Body.toString();
            return JSON.parse(json);
        } catch (err) {
            logger.error(`Error while retrieving ${requestParams.Bucket}/${requestParams.Key}`, err);
            throw err;
        }
    }
}
