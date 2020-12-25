import { Worklog } from "../../models/Worklog";
import { HasTagConditionConfiguration } from "./HasTagConditionConfiguration";

export class HasTagCondition {
    private _configuration: HasTagConditionConfiguration;

    constructor(conditionConfiguration: HasTagConditionConfiguration) {
        this._configuration = conditionConfiguration;
    }

    isSatisfiedBy(worklog: Worklog): boolean {
        const checkTagValue = !!this._configuration.tagValue;
        const worklogTagValue = worklog.getTagValue(this._configuration.tagName);

        return checkTagValue
            ? worklogTagValue == this._configuration.tagValue
            : !!worklogTagValue;
    }

    toString(): string {
        const tagValue = !this._configuration.tagValue
            ? ''
            : `: ${this._configuration.tagValue}`;
        return `HasTag(${this._configuration.tagName}${tagValue})`;
    }
}