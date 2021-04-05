import { ICondition } from '../conditions/ICondition';
import { IConditionConfig } from '../conditions/IConditionConfig';

export async function loadCondition(conditionConfig: IConditionConfig): Promise<ICondition> {
    let conditionType = (conditionConfig || {}).type;
    if (!conditionType) conditionType = 'true';

    const conditionClass = await import(`app/conditions/${conditionType}`);
    return new conditionClass(conditionConfig);
}
