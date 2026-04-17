export interface CreateProjectDTO {
  title: string;
  description?: string;
  ownerId?: string | null;
}

export interface ProjectsResponseDTO {
  id: string;
  title: string;
  description?: string | null;
  members: {
    id: string;
  }[];
  owner: {
    name: string;
  };
}
