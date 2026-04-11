export interface ITaskResponse {
  id: number;
  title: string;
  ticket: string;
  assignee?: string;
}

export interface IColumn {
  id: number;
  title: string;
  tasks: ITaskResponse[];
}
