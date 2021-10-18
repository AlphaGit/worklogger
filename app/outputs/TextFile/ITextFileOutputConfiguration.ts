import { IOutputConfiguration } from '../IOutputConfiguration';

export interface ITextFileOutputConfiguration extends IOutputConfiguration {
    filePath: string;
}
