export class HarvestClient {
    name: string;
}

export class HarvestProject {
    name: string;
}

export class HarvestTask {
    name: string;
}

export class HarvestTimeEntry {
    spent_date: string;
    started_time: string;
    ended_time: string;
    hours: number;
    notes: string;
    client: HarvestClient;
    project: HarvestProject;
    task: HarvestTask;
    project_id: number;
    task_id: number;
    is_running: boolean;
}