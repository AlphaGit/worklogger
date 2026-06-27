import { Worklog } from '../models/Worklog';

export interface IAction {
    apply(worklog: Worklog): void;
    toString(): string;
}
