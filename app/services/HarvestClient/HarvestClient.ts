import { HarvestTimeEntry } from '../../inputs/HarvestApp/Models';
import { HarvestProjectAndTasks } from './HarvestProjectAndTasks';
import { IHarvestConfiguration } from './IHarvestConfiguration';
import { IHarvestInternal_ProjectAssignmentResponse } from './IHarvestInternal_ProjectAssignmentResponse';
import fetch from 'node-fetch';
import { getLogger } from 'log4js';

const logger = getLogger('services/HarvestClient');

export class HarvestClient {
    static HarvestBaseUrl = 'https://api.harvestapp.com/api/v2';

    constructor(private configuration: IHarvestConfiguration) {
        this.validateConfiguration(configuration);
    }

    private validateConfiguration(configuration: IHarvestConfiguration): void {
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

        const response = await fetch(`${HarvestClient.HarvestBaseUrl}/time_entries?${params}`, {
            headers: this.getDefaultHeaders()
        });
        const jsonResponse = await response.json();
        logger.trace('Retrieved time entries from Harvest', jsonResponse);
        return jsonResponse.time_entries;
    }

    async getProjectsAndTasks(): Promise<HarvestProjectAndTasks[]> {
        logger.info('Retrieving known projects and tasks from Harvest');
        const response = await fetch(`${HarvestClient.HarvestBaseUrl}/users/me/project_assignments.json`, {
            headers: this.getDefaultHeaders()
        });

        const jsonResponse = await response.json();
        const projects = this.getProjectsAndTasksFromApiResponse(jsonResponse);
        logger.trace('Projects and tasks retrieved from Harvest', JSON.stringify(projects));

        return projects;
    }

    async saveNewTimeEntry(timeEntry: HarvestTimeEntry): Promise<void> {
        this.validateTimeEntry(timeEntry);

        logger.trace('Sending to Harvest:', JSON.stringify(timeEntry));
        const res = await fetch(`${HarvestClient.HarvestBaseUrl}/time_entries`, {
            method: 'POST',
            body: JSON.stringify(timeEntry),
            headers: this.getDefaultHeaders()
        })

        logger.trace(await res.json());
    }

    private validateTimeEntry(timeEntry: HarvestTimeEntry): void {
        if (!timeEntry) throw new Error('Required parameter: timeEntry.');
        if (!timeEntry.project_id) throw new Error('Time entry needs to have project_id.');
        if (!timeEntry.task_id) throw new Error('Time entry needs to have task_id.');
        if (!timeEntry.spent_date) throw new Error('Time entry needs to have spent_date.');
        if (!timeEntry.hours) throw new Error('Time entry needs to have hours.');
        if (!timeEntry.started_time) throw new Error('Time entry needs to have started_time.');
        if (!timeEntry.ended_time) throw new Error('Time entry needs to have ended_time.');
    }

    private getProjectsAndTasksFromApiResponse(apiResponse: IHarvestInternal_ProjectAssignmentResponse): HarvestProjectAndTasks[] {
        return apiResponse.project_assignments.map(pa => ({
            projectId: pa.project.id,
            projectName: pa.project.name,
            tasks: pa.task_assignments.map(ta => ({
                taskId: ta.task.id,
                taskName: ta.task.name
            }))
        }));
    }

    private getDefaultHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.configuration.token}`,
            'Harvest-Account-Id': `${this.configuration.accountId}`,
            'User-Agent': `Worklogger (${this.configuration.contactInformation})`,
            'Content-Type': 'application/json'
        };
    }
}