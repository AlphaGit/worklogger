import { IOutputConfiguration } from '../IOutputConfiguration';

export interface IAwsSesOutputConfiguration extends IOutputConfiguration {
    subjectTemplate: string;
    bodyTemplate: string;
    fromAddress: string;
    toAddresses: string[];
}
