import { ApiOptions } from "@/types/api";
import { User } from "@/types/auth";


const BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/";







function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("tesla_token");
}

export function setSession(
  token: string,
  user: User
): void {
  localStorage.setItem("tesla_token", token);
  localStorage.setItem(
    "tesla_user",
    JSON.stringify(user)
  );
}

export function getUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem("tesla_user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem("tesla_token");
  localStorage.removeItem("tesla_user");
}

export async function api(
  path: string,
  {
    method = "GET",
    body,
  }: ApiOptions = {}
): Promise<any> {
  const token = getToken();

  const res = await fetch(`${BASE}api${path}`, {
    method,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },

    body: body
      ? JSON.stringify(body)
      : undefined,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch {
    // Response was not JSON
  }

  if (!res.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Request failed (${res.status})`
    );
  }

  return data;
}