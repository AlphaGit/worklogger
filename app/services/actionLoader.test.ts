import { describe, test, expect } from "@jest/globals";

import { AddTagAction } from '../actions/AddTag';
import { SummaryMatchesCondition } from '../conditions/SummaryMatches';
import { TrueCondition } from '../conditions/True';
import { loadActionsAndConditions } from './actionLoader';

describe('loadActionsAndConditions', () => {
    test('loads specified actions', async () => {
        const actionsToLoad = [{
            action: {
                type: 'AddTag',
                tagsToAdd: ['tag1']
            },
            condition: {
                type: 'SummaryMatches'
            }
        }, {
            action: {
                type: 'AddTag',
                tagsToAdd: ['tag2']
            }
        }];
        const [action1, action2] = await loadActionsAndConditions(actionsToLoad);

        expect(action1.action).toBeInstanceOf(AddTagAction);
        expect(action1.condition).toBeInstanceOf(SummaryMatchesCondition);

        expect(action2.action).toBeInstanceOf(AddTagAction);
        expect(action2.condition).toBeInstanceOf(TrueCondition)
    });
});