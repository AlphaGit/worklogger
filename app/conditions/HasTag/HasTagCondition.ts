import { Worklog } from "../../models/Worklog";
import { HasTagConditionConfiguration } from "./HasTagConditionConfiguration";
import { ICondition } from "../ICondition";

export class HasTagCondition implements ICondition {
    constructor(private configuration: HasTagConditionConfiguration) { }

    isSatisfiedBy(worklog: Worklog): boolean {
        const checkTagValue = !!this.configuration.tagValue;
        const worklogTagValue = worklog.getTagValue(this.configuration.tagName);

        return checkTagValue
            ? worklogTagValue == this.configuration.tagValue
            : !!worklogTagValue;
    }

    toString(): string {
        const tagValue = !this.configuration.tagValue
            ? ''
            : `: ${this.configuration.tagValue}`;
        return `HasTag(${this.configuration.tagName}${tagValue})`;
    }
}