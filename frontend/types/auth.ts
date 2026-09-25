export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
export type UserRole = "DRIVER" | "PASSENGER";
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "PASSENGER";
}

export interface AuthResponse {
  token: string;
  user: User;
}