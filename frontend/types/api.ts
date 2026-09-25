import { LoginData, SignupData } from "./auth";

type ApiBody = LoginData | SignupData;

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: ApiBody | Record<string, unknown>;
}