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

    private name: string;

    constructor(formatter: FormatterBase, outputConfiguration: IAwsSesOutputConfiguration, appConfiguration: IAppConfiguration) {
    private name: string;

    constructor(formatter: FormatterBase, outputConfiguration: IAwsSesOutputConfiguration, appConfiguration: IAppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
        this._configuration = outputConfiguration;
        this.name = outputConfiguration.name;

        const region = this._configuration.aws.region;
        this.SES = new SESv2Client({ region });
    }

    private addNamePrefix(message: string): string {
        return `[${this.name}] ${message}`;
    }

    private logDebug(message: string, ...args: any[]): void {
        this.logger.debug(this.addNamePrefix(message), ...args);
    }

    private logInfo(message: string, ...args: any[]): void {
        this.logger.info(this.addNamePrefix(message), ...args);
    }

    private logError(message: string, ...args: any[]): void {
        this.logger.error(this.addNamePrefix(message), ...args);
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = await this._formatter.format(worklogSet);

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
                        Html: {
                            Charset: 'UTF-8',
                            Data: '<html><body>' + body + '</body></html>'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject
                    }
                }
            }
        };

        this.logDebug('Email params:', email, 'body:', body);
        const command = new SendEmailCommand(email);
        await this.SES.send(command);
        this.logInfo('Successfully sent worklogSet to SES.');
    }
}

export default AwsSesOutput;

    private addNamePrefix(message: string): string {
        return `[${this.name}] ${message}`;
    }

    private logDebug(message: string, ...args: any[]): void {
        this.logger.debug(this.addNamePrefix(message), ...args);
    }

    private logInfo(message: string, ...args: any[]): void {
        this.logger.info(this.addNamePrefix(message), ...args);
    }

    private logError(message: string, ...args: any[]): void {
        this.logger.error(this.addNamePrefix(message), ...args);
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = await this._formatter.format(worklogSet);

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
                        Html: {
                            Charset: 'UTF-8',
                            Data: '<html><body>' + body + '</body></html>'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject
                    }
                }
            }
        };

        this.logDebug('Email params:', email, 'body:', body);
        const command = new SendEmailCommand(email);
        await this.SES.send(command);
        this.logInfo('Successfully sent worklogSet to SES.');
    }
}

export default AwsSesOutput;

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = await this._formatter.format(worklogSet);

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
                        Html: {
                            Charset: 'UTF-8',
                            Data: '<html><body>' + body + '</body></html>'
                        }
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject
                    }
                }
            }
        };

        this.logger.debug('Email params:', email, 'body:', body);
        const command = new SendEmailCommand(email);
        await this.SES.send(command);
        this.logger.info('Successfully sent worklogSet to SES.');
    }
}

export default AwsSesOutput;