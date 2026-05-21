export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  image: string;
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
