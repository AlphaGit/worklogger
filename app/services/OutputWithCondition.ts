import { OutputBase } from '../outputs/OutputBase';
import { ICondition } from '../conditions/ICondition';

export interface OutputWithCondition {
    output: OutputBase;
    condition: ICondition;
    excludeFromNonProcessedWarning: boolean;
}
