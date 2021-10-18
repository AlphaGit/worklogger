import { Worklog } from '../models/Worklog';

export interface IInput {
    name: string;
    getWorkLogs(startDateTime: Date, endDateTime: Date): Promise<Worklog[]>;
}