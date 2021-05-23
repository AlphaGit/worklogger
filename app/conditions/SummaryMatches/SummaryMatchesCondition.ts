import { Worklog } from "../../models";
import { ICondition } from "../ICondition";

export interface ISummaryMatchesConditionConfiguration {
    regex: string;
}

export class SummaryMatchesCondition implements ICondition {
    private _regex: RegExp;

    constructor(conditionConfiguration: ISummaryMatchesConditionConfiguration) {
        this._regex = new RegExp(conditionConfiguration.regex);
    }

    isSatisfiedBy(worklog: Worklog): boolean {
        return this._regex.test(worklog.name);
    }

    toString(): string {
        return `SummaryMatches(${this._regex.toString()})`;
    }
}