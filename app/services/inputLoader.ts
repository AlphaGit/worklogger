import { LoggerFactory } from './LoggerFactory';
import { ServiceRegistrations } from '../models/ServiceRegistrations';
import { AppConfiguration } from '../models/AppConfiguration';
import { IInput } from '../inputs/IInput';

const logger = LoggerFactory.getLogger('services/inputLoader');

export async function loadInputs(serviceRegistrations: ServiceRegistrations, appConfiguration: AppConfiguration): Promise<IInput[]> {
    const loadedInputs: IInput[] = [];

    for (const input of appConfiguration.inputs) {
        logger.debug('Loading configuration for', input.type);

        const inputConfigurationClass = await import(`app/inputs/${input.type}/InputConfiguration`);
        const inputConfiguration = new inputConfigurationClass(input);

        const inputSystemClass = await import(`app/inputs/${input.type}/Input`);
        const inputSystem = new inputSystemClass(serviceRegistrations, appConfiguration, inputConfiguration);

        loadedInputs.push(inputSystem);
    }

    return loadedInputs;
}