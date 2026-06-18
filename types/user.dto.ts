export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface UserBasicInfoDTO extends UserResponseDTO {
  memberships: {
    projectId: string;
    role: {
      id: string;
      name: string;
    };
  }[];
}
