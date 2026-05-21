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

export type TProjectFilter = "all" | "owned" | "shared";
