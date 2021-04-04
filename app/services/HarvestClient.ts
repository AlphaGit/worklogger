import node_fetch = require('node-fetch');
const fetch = node_fetch.default;
import { HarvestTimeEntry } from '../inputs/HarvestApp/TimeEntry';

import LoggerFactory from './LoggerFactory';

const logger = LoggerFactory.getLogger('services/HarvestClient');

interface IHarvestConfiguration {
    accountId: string;
    token: string;
    contactInformation: string;
}

export default class HarvestClient {
    private _configuration: IHarvestConfiguration;
    private _harvestBaseUrl = 'https://api.harvestapp.com/api/v2';
    private _fetch: typeof node_fetch.default;

    constructor(configuration: IHarvestConfiguration) {
        this._validateConfiguration(configuration);

        this._configuration = configuration;
        this._fetch = fetch;
    }

    _validateConfiguration(configuration: IHarvestConfiguration): void {
        if (!configuration) throw new Error('Missing parameter: configuration.');
        if (!configuration.accountId) throw new Error('Required configuration: accountId.');
        if (!configuration.token) throw new Error('Required configuration: token.');
        if (!configuration.contactInformation) throw new Error('Required configuration: contactInformation.');
    }

    async getTimeEntries({ from, to }: { from: Date, to: Date }): Promise<HarvestTimeEntry[]> {
        logger.info('Retrieving time entries from Harvest');
 
        const params = new URLSearchParams();
        if (from) params.set('from', from.toISOString());
        if (to) params.set('to', to.toISOString());

        const response = await this._fetch(`${this._harvestBaseUrl}/time_entries?${params}`, {
            headers: this._getDefaultHeaders()
        });
        const jsonResponse = await response.json();
        logger.trace('Retrieved time entries from Harvest', jsonResponse);
        return jsonResponse.time_entries;
    }

    async getProjectsAndTasks(): Promise<HarvestProjectAndTasks[]> {
        logger.info('Retrieving known projects and tasks from Harvest');
        const response = await this._fetch(`${this._harvestBaseUrl}/users/me/project_assignments.json`, {
            headers: this._getDefaultHeaders()
        });

        const jsonResponse = await response.json();
        const projects = this._getProjectsAndTasksFromApiResponse(jsonResponse);
        logger.trace('Projects and tasks retrieved from Harvest', JSON.stringify(projects));

        return projects;
    }

    async saveNewTimeEntry(timeEntry: HarvestTimeEntry): Promise<void> {
        this._validateTimeEntry(timeEntry);

        logger.trace('Sending to Harvest:', JSON.stringify(timeEntry));
        const res = await this._fetch('https://api.harvestapp.com/api/v2/time_entries', {
            method: 'POST',
            body: JSON.stringify(timeEntry),
            headers: this._getDefaultHeaders()
        })

        logger.trace(await res.json());
    }

    _validateTimeEntry(timeEntry: HarvestTimeEntry): void {
        if (!timeEntry) throw new Error('Required parameter: timeEntry.');
        if (!timeEntry.project_id) throw new Error('Time entry needs to have project_id.');
        if (!timeEntry.task_id) throw new Error('Time entry needs to have task_id.');
        if (!timeEntry.spent_date) throw new Error('Time entry needs to have spent_date.');
        if (!timeEntry.hours) throw new Error('Time entry needs to have hours.');
        if (!timeEntry.started_time) throw new Error('Time entry needs to have started_time.');
        if (!timeEntry.ended_time) throw new Error('Time entry needs to have ended_time.');
    }

    _getProjectsAndTasksFromApiResponse(apiResponse: IHarvestInternal_ProjectAssignmentResponse): HarvestProjectAndTasks[] {
        return apiResponse.project_assignments.map(pa => ({
            projectId: pa.project.id,
            projectName: pa.project.name,
            tasks: pa.task_assignments.map(ta => ({
                taskId: ta.task.id,
                taskName: ta.task.name
            }))
        }));
    }

    _getDefaultHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this._configuration.token}`,
            'Harvest-Account-Id': `${this._configuration.accountId}`,
            'User-Agent': `Worklogger (${this._configuration.contactInformation})`,
            'Content-Type': 'application/json'
        };
    }
}

interface HarvestProjectAndTasks {
    projectId: number;
    projectName: string;
    tasks: {
        taskId: number;
        taskName: string;
    }[];
}

interface IHarvestInternal_TaskAssignment {
    task: {
        id: number;
        name: string;
    };
} 

interface IHarvestInternal_ProjectAssignment {
    project: {
        id: number;
        name: string;
    }; 
    task_assignments: IHarvestInternal_TaskAssignment[];
}

interface IHarvestInternal_ProjectAssignmentResponse {
    project_assignments: IHarvestInternal_ProjectAssignment[];
}