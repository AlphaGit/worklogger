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
    spent_date;
    started_time;
    ended_time;
    hours;
    notes;
    client: HarvestClient;
    project: HarvestProject;
    task: HarvestTask;
    project_id: number;
    task_id: number;
}