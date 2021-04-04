import LoggerFactory from './LoggerFactory';
const logger = LoggerFactory.getLogger('services/actionLoader');

import conditionLoader from './conditionLoader';

import { IAction } from '../actions/IAction'
import { ICondition } from '../conditions/ICondition';

export async function loadActionsAndConditions(actionConfigs: Transformation[]): Promise<IActionWithCondition[]> {
    return Promise.all(actionConfigs.map(async config => {
        const action = await loadAction(config.action) as IAction;
        const condition = await conditionLoader.loadCondition(config.condition) as ICondition;
        logger.debug('Loaded: On condition', condition.toString(), 'apply action', action.toString());
        return { action, condition };
    }));
}

async function loadAction(actionConfig) {
    const actionClass = await import(`app/actions/${actionConfig.type}`);
    return new actionClass(actionConfig);
}

class Transformation {
    action: string;
    condition: string;
}

interface IActionWithCondition {
    action: IAction;
    condition: ICondition;
}