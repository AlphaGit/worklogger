import { IServiceRegistrations } from '../models/ServiceRegistrations';
import { IAppConfiguration } from '../models/AppConfiguration';
import { IInput } from '../inputs/IInput';
import { getLogger, LoggerCategory } from '../services/Logger';

const logger = getLogger(LoggerCategory.Services);

// Loading these eagerly because dynamic imports mess up with the webpack build.
import { Input as GoogleCalendarInput } from '../inputs/GoogleCalendar';
import { Input as HarvestAppInput } from '../inputs/HarvestApp';

const inputClasses = {
    "GoogleCalendar": GoogleCalendarInput,
    "HarvestApp": HarvestAppInput,
}

export async function loadInputs(serviceRegistrations: IServiceRegistrations, appConfiguration: IAppConfiguration): Promise<IInput[]> {
    const loadedInputs: IInput[] = [];

    for (const input of appConfiguration.inputs) {
        logger.debug('Loading', input.type);

        const inputClass = inputClasses[input.type];
        if (!inputClass)
            throw new Error(`Input ${input.type} not recognized.`);

        const inputInstance = new inputClass(serviceRegistrations, appConfiguration, input);
        loadedInputs.push(inputInstance);
    }

    return loadedInputs;
}