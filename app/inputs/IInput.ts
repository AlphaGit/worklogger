import { Worklog } from '../models/Worklog';

export interface IInput {
    getWorkLogs(startDateTime: Date, endDateTime: Date): Promise<Worklog[]>;
}