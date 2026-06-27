import { loadCondition } from './conditionLoader';
import { IAction } from '../actions/IAction'
import { ICondition } from '../conditions/ICondition';
import { IConditionConfig } from '../conditions/IConditionConfig';

import { getLogger, LoggerCategory } from '../services/Logger';

// Loading these eagerly because dynamic imports mess up with the webpack build.
import { AddTagAction } from '../actions/AddTag';

const actionClasses = {
    "AddTag": AddTagAction
}

const logger = getLogger(LoggerCategory.Services);

export async function loadActionsAndConditions(actionConfigs: ITransformation[]): Promise<IActionWithCondition[]> {
    return await Promise.all(actionConfigs.map(async config => {
        const action = await loadAction(config.action) as IAction;
        const condition = await loadCondition(config.condition) as ICondition;
        logger.debug('Loaded: On condition', condition.toString(), 'apply action', action.toString());
        return { action, condition };
    }));
}

async function loadAction(actionConfig: { type: string }) {
    const actionClass = actionClasses[actionConfig.type];
    if (!actionClass)
        throw new Error(`Action ${actionConfig.type} not recognized.`);

    return new actionClass(actionConfig);
}

export interface ITransformation {
    action: {
        type: string
    };
    condition: IConditionConfig | undefined;
}

export interface IActionWithCondition {
    action: IAction;
    condition: ICondition;
}