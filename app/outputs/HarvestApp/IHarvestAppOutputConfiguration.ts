import { IOutputConfiguration } from '../IOutputConfiguration';
import { IHarvestConfiguration } from '../../services/HarvestClient/IHarvestConfiguration';

export interface IHarvestAppOutputConfiguration extends IOutputConfiguration, IHarvestConfiguration {
    selectProjectFromTag: string;
    selectTaskFromTag: string;
    name: string;
}
