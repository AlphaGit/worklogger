import { Worklog } from "../../models/Worklog";

export class TrueCondition {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSatisfiedBy(worklog: Worklog): boolean {
        return true;
    }
}