import { OutputBase } from '../../outputs/OutputBase';
import { AppConfiguration, WorklogSet } from '../../models';
import { FormatterBase } from '../../formatters/FormatterBase';
import { IAwsSesOutputConfiguration } from './IAwsSesOutputConfiguration';

import { getLogger } from 'log4js';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { render } from 'mustache';

export class AwsSesOutput extends OutputBase {
    private SES: SESv2Client;
    private _configuration: IAwsSesOutputConfiguration;
    private logger = getLogger('AWS-SES/Output');

    constructor(formatter: FormatterBase, outputConfiguration: IAwsSesOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
        this._configuration = outputConfiguration;

        this.SES = new SESv2Client({ });
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        const subject = render(this._configuration.subjectTemplate, worklogSet);
        const body = render(this._configuration.bodyTemplate, { contents: formattedOutput, ...worklogSet });

        const email: SendEmailCommandInput = {
            FromEmailAddress: this._configuration.fromAddress,

            Destination: {
                ToAddresses: this._configuration.toAddresses
            },

            Content: {
                Simple: {
                    Body: {
                        Text: {
                            Charset: 'UTF-8',
                            Data: body
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject
                    }
                }
            }
        };

        this.logger.debug('Email params:', email);

        await this.SES.send(new SendEmailCommand(email));
        this.logger.info('Successfully sent worklogSet to SES.');
    }
}