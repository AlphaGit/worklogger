import { loadCondition } from './conditionLoader';
import { IAction } from '../actions/IAction'
import { ICondition } from '../conditions/ICondition';
import { IConditionConfig } from '../conditions/IConditionConfig';

import { getLogger } from 'log4js';

const logger = getLogger('services/actionLoader');

export async function loadActionsAndConditions(actionConfigs: Transformation[]): Promise<IActionWithCondition[]> {
    return await Promise.all(actionConfigs.map(async config => {
        const action = await loadAction(config.action) as IAction;
        const condition = await loadCondition(config.condition) as ICondition;
        logger.debug('Loaded: On condition', condition.toString(), 'apply action', action.toString());
        return { action, condition };
    }));
}

async function loadAction(actionConfig) {
    const actionClass = await import(`app/actions/${actionConfig.type}`);
    return new actionClass.default(actionConfig);
}

class Transformation {
    action: {
        type: string
    };
    condition: IConditionConfig;
}

interface IActionWithCondition {
    action: IAction;
    condition: ICondition;
}