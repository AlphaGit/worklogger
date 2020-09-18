const OutputBase = require('app/outputs/OutputBase');
const DefaultSESClient = require('aws-sdk/clients/ses');
const logger = require('app/services/loggerFactory').getLogger('AWS-SES/Output');
const mustache = require('mustache');

module.exports = class AwsSesOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { SESClient = DefaultSESClient } = {}) {
        super(formatter, outputConfiguration);

        this.SES = new SESClient();
    }

    async outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        const subject = mustache.render(this._configuration.subjectTemplate, worklogSet);
        const body = mustache.render(this._configuration.bodyTemplate, { contents: formattedOutput, ...worklogSet });

        const email = {
            Source: this._configuration.fromAddress,

            Destination: {
                ToAddresses: this._configuration.toAddresses
            },

            Message: {
                Body: {
                    Text: {
                        Charset: 'UTF-8',
                        Data: body
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                },
            }
        };

        logger.debug('Email params:', email);

        await this.SES.sendEmail(email).promise();
        logger.info('Successfully sent worklogSet to SES.');
    }
}