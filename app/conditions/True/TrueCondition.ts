import { Worklog } from "../../models/Worklog";
import { ICondition } from "../ICondition";

export class TrueCondition implements ICondition {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSatisfiedBy(worklog: Worklog): boolean {
        return true;
    }
}