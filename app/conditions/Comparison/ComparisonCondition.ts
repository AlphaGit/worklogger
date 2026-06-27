import { WorklogSet } from "../../models/WorklogSet";
import { IWorklogSetCondition } from "../IWorklogSetCondition";
import { ComparisonConditionConfiguration, Operand } from "./ComparisonConditionConfiguration";

export class ComparisonCondition implements IWorklogSetCondition {
    constructor(private configuration: ComparisonConditionConfiguration) {}

    isSatisfiedBy(worklogSet: WorklogSet): boolean {
        const left = this._getOperandValue(this.configuration.operand1, worklogSet);
        const right = this._getOperandValue(this.configuration.operand2, worklogSet);

        switch (this.configuration.operator) {
            case 'eq': return left === right;
            case 'gt': return left > right;
            case 'lt': return left < right;
            case 'gte': return left >= right;
            case 'lte': return left <= right;
            default:
                throw new Error(`Operator ${this.configuration.operator} not supported.`);
        }
    }

    toString(): string {
        const { operator, operand1, operand2 } = this.configuration;
        return `ComparisonCondition(${this._operandToString(operand1)} ${operator} ${this._operandToString(operand2)})`;
    }

    private _getOperandValue(operand: Operand, worklogSet: WorklogSet): number {
        if (operand.type === 'constant') return operand.value;

        if (operand.field === 'totalDuration') {
            return worklogSet.worklogs
                .map(w => w.getDurationInMinutes())
                .reduce((d1, d2) => d1 + d2, 0);
        }

        throw new Error(`Field ${operand.field} not supported.`);
    }

    private _operandToString(operand: Operand): string {
        return operand.type === 'constant' ? operand.value.toString() : operand.field;
    }
}

export default ComparisonCondition;
