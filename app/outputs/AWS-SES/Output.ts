import { OutputBase } from '../../outputs/OutputBase';
import { LoggerFactory } from '../../services/LoggerFactory';
import { AppConfiguration } from '../../models/AppConfiguration';
import { FormatterBase } from '../../formatters/FormatterBase';
import { WorklogSet } from '../../models/WorklogSet';
import { IAwsSesOutputConfiguration } from './IAwsSesOutputConfiguration';

import DefaultSESClient from 'aws-sdk/clients/ses';
import mustache from 'mustache';

const logger = LoggerFactory.getLogger('AWS-SES/Output');

export class AwsSesOutput extends OutputBase {
    private SES: DefaultSESClient;
    private _configuration: IAwsSesOutputConfiguration;

    constructor(formatter: FormatterBase, outputConfiguration: IAwsSesOutputConfiguration, appConfiguration: AppConfiguration, { SESClient = DefaultSESClient } = {}) {
        super(formatter, outputConfiguration, appConfiguration);
        this._configuration = outputConfiguration;

        this.SES = new SESClient();
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
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