import { ServiceRegistrations } from '../models/ServiceRegistrations';
import { AppConfiguration } from '../models/AppConfiguration';
import { IInput } from '../inputs/IInput';
import { getLogger } from 'log4js';

const logger = getLogger('services/inputLoader');

export async function loadInputs(serviceRegistrations: ServiceRegistrations, appConfiguration: AppConfiguration): Promise<IInput[]> {
    const loadedInputs: IInput[] = [];

    for (const input of appConfiguration.inputs) {
        logger.debug('Loading configuration for', input.type);

        const inputConfigModule = await import(`app/inputs/${input.type}/InputConfiguration`);
        const inputConfiguration = new inputConfigModule.default(input);

        const inputSystemModule = await import(`app/inputs/${input.type}/Input`);
        const inputSystem = new inputSystemModule.default(serviceRegistrations, appConfiguration, inputConfiguration);

        loadedInputs.push(inputSystem);
    }

    return loadedInputs;
}