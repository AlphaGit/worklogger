import { IOutputConfiguration } from '../IOutputConfiguration';

export interface IAwsSesOutputConfiguration extends IOutputConfiguration {
    aws: {
        region: string
    }
    subjectTemplate: string;
    bodyTemplate: string;
    fromAddress: string;
    toAddresses: string[];
}
