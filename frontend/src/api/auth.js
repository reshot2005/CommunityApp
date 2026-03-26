import api from "./client";

function getApiBaseUrl() {
  return api.defaults.baseURL || "http://localhost:5000/api";
}

export async function registerUser(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function loginUser({ email, password }) {
  const { data } = await api.post("/auth/login", {
    email,
    password
  });
  return data;
}

export function getOAuthUrl(provider, role = "student") {
  const apiBaseUrl = getApiBaseUrl().replace(/\/$/, "");
  const url = new URL(`${apiBaseUrl}/auth/oauth/${provider}/start`);
  url.searchParams.set("role", role);
  return url.toString();
}

export async function fetchOAuthProviders() {
  const { data } = await api.get("/auth/oauth/providers");
  return data.providers ?? {};
}
