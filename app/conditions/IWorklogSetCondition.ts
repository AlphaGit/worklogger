import { WorklogSet } from "../models/WorklogSet";

export interface IWorklogSetCondition {
    isSatisfiedBy(worklogSet: WorklogSet): boolean;
    toString(): string;
}
