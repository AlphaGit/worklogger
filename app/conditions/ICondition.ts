import { Worklog } from "../models/Worklog";


export interface ICondition {
    isSatisfiedBy(worklog: Worklog): boolean;
    toString(): string;
}
