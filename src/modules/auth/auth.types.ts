export interface JwtUserPayload {
  id: string;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  status?: string;
  lastLogin?: Date;
  profileImage?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}


