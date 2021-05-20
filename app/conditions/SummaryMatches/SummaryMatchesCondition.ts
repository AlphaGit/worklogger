import { Worklog } from "../../models";
import { ICondition } from "../ICondition";

export interface ISummaryConditionConfiguration {
    regex: string;
}

export class SummaryCondition implements ICondition {
    private _regex: RegExp;

    constructor(conditionConfiguration: ISummaryConditionConfiguration) {
        this._regex = new RegExp(conditionConfiguration.regex);
    }

    isSatisfiedBy(worklog: Worklog): boolean {
        return this._regex.test(worklog.name);
    }

    toString(): string {
        return `SummaryMatches(${this._regex.toString()})`;
    }
}