export interface CreateProjectDTO {
  title: string;
  description?: string;
  ownerId: string;
  imageUrl?: string;
}

export interface ProjectsResponseDTO {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  members: {
    id: string;
  }[];
  owner: {
    name: string;
  };
}

export type TProjectFilter = "all" | "owned" | "shared" | "recent";

// Single-project detail used by the Settings tab (and the Add Task priority
// default). Includes ownerId so the client can decide whether to show
// owner-only controls.
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
