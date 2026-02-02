import { api } from "./api";
import { unwrap } from "./unwrap";

export async function login(email: string, password: string) {
  const data = await unwrap<{ accessToken: string }>(
    api.post("/auth/login", { email, password })
  );
  localStorage.setItem("accessToken", data.data.accessToken);
  return data;
}

export async function register(email: string, password: string, name?: string) {
  const data = await unwrap<{ accessToken: string }>(
    api.post("/auth/register", { email, password, name })
  );
  localStorage.setItem("accessToken", data.data.accessToken);
  return data;
}

export async function logout() {
  localStorage.removeItem("accessToken");
}
