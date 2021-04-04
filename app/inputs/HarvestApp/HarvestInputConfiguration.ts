import { IHarvestConfiguration } from '../../services/HarvestClient/IHarvestConfiguration';

export class HarvestInputConfiguration implements IHarvestConfiguration {
    accountId: string;
    token: string;
    contactInformation: string;
    name: string;
}
