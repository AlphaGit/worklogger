import { IConditionConfig } from '../conditions/IConditionConfig';
import { IFormatterConfig } from '../formatters/IFormatterConfig';

export interface IOutputConfiguration {
    type: string;
    name: string;
    excludeFromNonProcessedWarning: boolean;
    condition: IConditionConfig;
    formatter?: IFormatterConfig;
}