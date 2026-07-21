export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

// Nullable variant used by the Settings profile/account cards (User.name and
// User.image are optional in the schema).
export interface UserProfileDTO {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}
