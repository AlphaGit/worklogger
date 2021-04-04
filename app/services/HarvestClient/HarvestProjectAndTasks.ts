export interface HarvestProjectAndTasks {
    projectId: number;
    projectName: string;
    tasks: {
        taskId: number;
        taskName: string;
    }[];
}
