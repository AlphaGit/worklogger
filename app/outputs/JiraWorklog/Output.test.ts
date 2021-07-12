import { JiraWorklogOutput } from '.';
import { AppConfigurations, Formatters } from '../../../tests/entities';
import { IJiraWorklogOutputConfiguration } from './IJiraWorklogOutputConfiguration';

const jiraClientConstructorMock = jest.fn();

jest.mock('./JiraClient', () => ({
    JiraClient: (...args) => jiraClientConstructorMock(...args)
}));

describe('constructor', () => {
    test('instantiates a JiraClient with the configured options', () => {
        const outputConfiguration = {
            JiraUrl: 'https://jira.example.com/',
            JiraPassword: 'Qwerty123',
            JiraUsername: 'Username123'
        } as IJiraWorklogOutputConfiguration;
        new JiraWorklogOutput(Formatters.fake(), outputConfiguration, AppConfigurations.normal());

        expect(jiraClientConstructorMock).toHaveBeenCalledWith(outputConfiguration);
    });
});