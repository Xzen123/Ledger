const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "liferpg_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // No JSON body (e.g. some error pages) — fall through with null data.
  }

  if (!res.ok) {
    throw new ApiError(data?.error || "Something went wrong.", res.status);
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  googleAuth: (payload) => request("/auth/google", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  listTasks: (status) => request(`/tasks${status ? `?status=${status}` : ""}`),
  createTask: (payload) => request("/tasks", { method: "POST", body: payload }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: "PUT", body: payload }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  completeTask: (id) => request(`/tasks/${id}/complete`, { method: "POST" }),
  getAnalytics: () => request("/tasks/analytics"),

  getCharacter: () => request("/character"),
  setTheme: (theme) => request("/character/theme", { method: "PUT", body: { theme } }),

  listShopItems: () => request("/shop/items"),
  buyItem: (id) => request(`/shop/buy/${id}`, { method: "POST" }),

  getLeaderboard: (period = "daily") => request(`/leaderboard?period=${period}`),
  getAuditLogs: () => request("/leaderboard/audit-logs"),
  reportBot: (payload) => request("/leaderboard/report", { method: "POST", body: payload }),
  appealReset: () => request("/tasks/appeal-reset", { method: "POST" }),
};

export { ApiError };
