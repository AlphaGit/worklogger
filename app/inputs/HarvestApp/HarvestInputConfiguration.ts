import { IHarvestConfiguration } from '../../services/HarvestClient/IHarvestConfiguration';

export type HarvestInputConfiguration = IHarvestConfiguration & {
    accountId: string;
    token: string;
    contactInformation: string;
    name: string;
}
