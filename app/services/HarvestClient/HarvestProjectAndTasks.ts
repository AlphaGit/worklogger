import { HarvestTask } from "./HarvestTask";

export interface HarvestProjectAndTasks {
    projectId: number;
    projectName: string;
    tasks: HarvestTask[];
}

