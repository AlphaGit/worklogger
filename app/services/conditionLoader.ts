import { ICondition } from '../conditions/ICondition';
import { IConditionConfig } from '../conditions/IConditionConfig';

// Loading these eagerly because dynamic imports mess up with the webpack build.
import { HasTagCondition } from '../conditions/HasTag';
import { SummaryMatchesCondition } from '../conditions/SummaryMatches';
import { TrueCondition } from '../conditions/True';

const conditionClasses = {
    "HasTag": HasTagCondition,
    "SummaryMatches": SummaryMatchesCondition,
    "True": TrueCondition
}

export async function loadCondition(conditionConfig: IConditionConfig): Promise<ICondition> {
    let conditionType = (conditionConfig || {}).type;
    if (!conditionType) conditionType = 'True';

    const conditionClass = conditionClasses[conditionType];
    if (!conditionClass)
        throw new Error(`Condition ${conditionType} not recognized.`);

    return new conditionClass(conditionConfig);
}
