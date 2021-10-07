import { ICondition } from '../conditions/ICondition';
import { IConditionConfig } from '../conditions/IConditionConfig';

export async function loadCondition(conditionConfig: IConditionConfig): Promise<ICondition> {
    let conditionType = (conditionConfig || {}).type;
    if (!conditionType) conditionType = 'True/';

    const conditionClass = await import(`../conditions/${conditionType}`);
    return new conditionClass.default(conditionConfig);
}
