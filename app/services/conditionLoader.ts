import { ICondition } from '../conditions/ICondition';
import { IConditionConfig } from '../conditions/IConditionConfig';

export async function loadCondition(conditionConfig: IConditionConfig): Promise<ICondition> {
    let conditionType = (conditionConfig || {}).type;
    if (!conditionType) conditionType = 'True/';

    const conditionClass = await import(`../conditions/${conditionType}`);
    if (!conditionClass.default)
        throw new Error(`Condition module ${conditionType} does not have a default export.`);
    return new conditionClass.default(conditionConfig);
}
