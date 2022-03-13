import { OutputBase } from '../../outputs/OutputBase';
import { IAppConfiguration, WorklogSet } from '../../models';
import { FormatterBase } from '../../formatters/FormatterBase';
import { IAwsSesOutputConfiguration } from './IAwsSesOutputConfiguration';

import { getLogger, LoggerCategory } from '../../services/Logger';
import { SESv2Client, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-sesv2';
import { render } from 'mustache';

export class AwsSesOutput extends OutputBase {
    private SES: SESv2Client;
    private _configuration: IAwsSesOutputConfiguration;
    private logger = getLogger(LoggerCategory.Outputs);

    constructor(formatter: FormatterBase, outputConfiguration: IAwsSesOutputConfiguration, appConfiguration: IAppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
        this._configuration = outputConfiguration;

        const region = this._configuration.aws.region;
        this.SES = new SESv2Client({ region });
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
                        },
                        Html: {
                            Charset: 'UTF-8',
                            Data: '<html><body>' + body.replace(/\n/g, '<br/>') + '</body></html>'
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
        const command = new SendEmailCommand(email);
        await this.SES.send(command);
        this.logger.info('Successfully sent worklogSet to SES.');
    }
}

export default AwsSesOutput;