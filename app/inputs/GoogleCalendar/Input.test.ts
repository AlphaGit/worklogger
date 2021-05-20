import { Input } from '.'
import { AppConfiguration, ServiceRegistrations } from '../../models';
import { GoogleCalendarConfiguration } from './GoogleCalendarCalendarConfiguration';
import { ModelMapper } from './ModelMapper';

describe('constructor', () => {
    test('requires serverRegistrations to be present', () => {
        expect(() => new Input(new ServiceRegistrations(), new AppConfiguration(), new GoogleCalendarConfiguration(), new ModelMapper(10)));
    });
});