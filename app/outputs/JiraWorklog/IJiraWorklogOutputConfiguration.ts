import { IOutputConfiguration } from '../IOutputConfiguration';

export interface IJiraWorklogOutputConfiguration extends IOutputConfiguration {
    JiraUrl: string;
    JiraUsername: string;
    JiraPassword: string;
}
