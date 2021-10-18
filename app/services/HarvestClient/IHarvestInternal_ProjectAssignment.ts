import { IHarvestInternal_TaskAssignment } from './IHarvestInternal_TaskAssignment';

export interface IHarvestInternal_ProjectAssignment {
    project: {
        id: number;
        name: string;
    };
    task_assignments: IHarvestInternal_TaskAssignment[];
}
