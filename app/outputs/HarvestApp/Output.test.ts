import { HarvestAppOutput } from ".";
import { IHarvestAppOutputConfiguration } from "./IHarvestAppOutputConfiguration";
import { AppConfigurations } from '../../../tests/entities';

const configuration: IHarvestAppOutputConfiguration = {
    selectProjectFromTag: 'HarvestProjectTag',
    selectTaskFromTag: 'HarvestTaskTag',
    accountId: 'account-123',
    condition: undefined,
    contactInformation: 'test@example.com',
    excludeFromNonProcessedWarning: false,
    formatter: null,
    token: 'token-123',
    type: 'HarvestApp'
};

describe('constructor', () => {
    test('requires a formatter', () => {
        expect(() => new HarvestAppOutput(null, configuration, AppConfigurations.normal())).toThrow('Formatter is required.');
        expect(() => new HarvestAppOutput(undefined, configuration, AppConfigurations.normal())).toThrow('Formatter is required.');
    });
});