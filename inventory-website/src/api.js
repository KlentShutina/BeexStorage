// BeexStorage v2.0 — API client
//
// HOW TO USE:
//   This file replaces the localStorage layer in src/data.js when you're
//   ready to talk to the real backend. The existing mock layer is kept
//   in data.js for offline demos. Set VITE_USE_API=true in .env.local
//   to switch to the API.
//
// USAGE FROM A COMPONENT:
//   import { api } from "./api";
//   const { state, currentUser } = await api.snapshot(userId);
//   const { user } = await api.login("adminx", "12345");
//   await api.shelf.update(shelfId, { quantity: 50 });

const API =
  import.meta.env.VITE_API_URL ||
  "https://beex-storage-backend.onrender.com/api";

async function http(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* ignore parse error */
  }
  if (!res.ok || (data && data.success === false)) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

const get = (p) => http("GET", p);
const post = (p, b) => http("POST", p, b);
const put = (p, b) => http("PUT", p, b);
const del = (p) => http("DELETE", p);

export const api = {
  // ─── Auth ────────────────────────────────────────────────────────────
  login: (username, password) => post("/login", { username, password }),
  register: (form) => post("/register", form),

  // ─── Snapshot ────────────────────────────────────────────────────────
  snapshot: (userId) => get(`/state/${encodeURIComponent(userId)}`),

  // ─── Profile ─────────────────────────────────────────────────────────
  user: {
    update: (id, patch) => put(`/users/${encodeURIComponent(id)}`, patch),
    changePassword: (id, current, next) =>
      put(`/users/${encodeURIComponent(id)}/password`, { current, next }),
  },

  // ─── Storages ────────────────────────────────────────────────────────
  storage: {
    scan: (userId, scannedId) => post("/scan", { userId, scannedId }),
    listPublic: (q = "") =>
      get(`/storages/public${q ? `?q=${encodeURIComponent(q)}` : ""}`),
    requestJoin: (storageId, userId) =>
      post(
        `/storages/${encodeURIComponent(storageId)}/join-request`,
        { userId },
      ),
  },

  // ─── Inventory ───────────────────────────────────────────────────────
  row: {
    create: (storageId) =>
      post(`/storages/${encodeURIComponent(storageId)}/rows`),
    delete: (id) => del(`/rows/${encodeURIComponent(id)}`),
  },
  shelf: {
    create: (rowId) =>
      post(`/rows/${encodeURIComponent(rowId)}/shelves`),
    update: (id, patch) => put(`/shelves/${encodeURIComponent(id)}`, patch),
    delete: (id) => del(`/shelves/${encodeURIComponent(id)}`),
  },

  // ─── Orders ──────────────────────────────────────────────────────────
  order: {
    create: (data) => post("/orders", data),
    update: (id, patch) => put(`/orders/${encodeURIComponent(id)}`, patch),
  },

  // ─── Hierarchy / Admin ───────────────────────────────────────────────
  member: {
    setRole: (storageId, userId, role) =>
      put(
        `/storages/${encodeURIComponent(storageId)}/members/${encodeURIComponent(
          userId,
        )}/role`,
        { role },
      ),
    setAdmin: (storageId, userId, isAdmin) =>
      put(
        `/storages/${encodeURIComponent(storageId)}/members/${encodeURIComponent(
          userId,
        )}/admin`,
        { isAdmin },
      ),
  },
};

export const API_URL = API;
