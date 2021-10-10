import { IServiceRegistrations } from '../models/ServiceRegistrations';
import { IAppConfiguration } from '../models/AppConfiguration';
import { IInput } from '../inputs/IInput';
import { getLogger } from 'log4js';

const logger = getLogger('services/inputLoader');

export async function loadInputs(serviceRegistrations: IServiceRegistrations, appConfiguration: IAppConfiguration): Promise<IInput[]> {
    const loadedInputs: IInput[] = [];

    for (const input of appConfiguration.inputs) {
        logger.debug('Loading configuration for', input.type);

        const inputModule = await import(`../inputs/${input.type}/Input`);
        if (!inputModule.default) {
            throw new Error(`${input.type} does not declare a default export.`);
        }

        const inputSystem = new inputModule.default(serviceRegistrations, appConfiguration, input);

        loadedInputs.push(inputSystem);
    }

    return loadedInputs;
}