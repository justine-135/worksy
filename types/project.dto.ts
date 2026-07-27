export interface CreateProjectDTO {
  title: string;
  description?: string;
  ownerId: string;
  imageUrl?: string;
}

export type CreateProjectPayload = Omit<CreateProjectDTO, "ownerId">;

export interface ProjectsResponseDTO {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  count: number;
  owner: {
    name: string;
    image: string;
  };
}

export type TProjectFilter = "all" | "owned" | "shared" | "recent";

export interface ProjectDetailDTO {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  ownerId: string;
  defaultTaskPriority?: string | null;
}

export interface UpdateProjectSettingsDTO {
  title?: string;
  description?: string | null;
  defaultTaskPriority?: string;
}
