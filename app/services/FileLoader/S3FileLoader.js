const logger = require('app/services/loggerFactory').getLogger('services/FileLoader/S3FileLoader');
const S3 = require('aws-sdk/clients/s3');

class S3FileLoader {
    constructor(s3Bucket) {
        this.s3Bucket = s3Bucket;
    }

    loadJson(filePath) {
        const requestParams = {
            Bucket: this.s3Bucket,
            Key: filePath
        };

        logger.info(`Loading from S3 bucket: ${requestParams.Bucket}/${requestParams.Key}`)

        const s3Client = new S3();
        return new Promise((resolve, reject) => {
            s3Client.getObject(requestParams, (err, data) => {
                if (err) {
                    logger.error(`Error while retrieving ${requestParams.Bucket}/${requestParams.Key}`, err);
                    reject(err);
                    return;
                }

                const parsedJson = JSON.parse(data.Body);
                resolve(parsedJson);
            });
        });
    }
}

module.exports = {
    S3FileLoader
};