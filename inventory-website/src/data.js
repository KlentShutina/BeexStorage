// ─── DATA LAYER (Mock DB) ─────────────────────────────────────────────────────
// Per MVP §0: All roles, storage IDs, and order recipients are DYNAMIC variables.
// Nothing here is hardcoded against a particular user/role string — every check
// goes through helper functions that read from the storage's members map.

export const API = "https://beex-storage-backend.onrender.com/api";

// Roles list is the single source of truth. Add a role here and it appears
// everywhere (admin role-picker, RBAC pipeline, signup defaults).
export const ROLES = ["Student", "Teacher", "HOD", "Finance", "Warehouse"];

// Logistics pipeline order. Used to compute the "next approver" dynamically.
// STUDENT → TEACHER → HOD → FINANCE → WAREHOUSE  (per MVP §3)
export const ORDER_PIPELINE = ["Teacher", "HOD", "Finance", "Warehouse"];

export const STATUS = {
  PENDING_TEACHER: "PENDING_TEACHER",
  PENDING_HOD: "PENDING_HOD",
  PENDING_FINANCE: "PENDING_FINANCE",
  PENDING_WAREHOUSE: "PENDING_WAREHOUSE",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
};

// Soft-delete retention (MVP §5: 30-day retention)
export const SOFT_DELETE_RETENTION_DAYS = 30;

// Dev bypass credentials (MVP §1)
export const DEV_BYPASS = { username: "adminx", password: "12345" };

// ─── STORAGE KEYS ─────────────────────────────────────────────────────────────
const STORE_KEY = "beex.state.v4";

// ─── DEFAULT SEED ─────────────────────────────────────────────────────────────
function seedState() {
  const now = Date.now();
  return {
    users: [
      { id: "u_admin", username: "adminx", handle: "@adminx", email: "admin@beex.io", password: "12345" },
      { id: "u_albi", username: "Albi_student", handle: "@albi", email: "albi@school.al", password: "demo" },
      { id: "u_klar", username: "Profesor_Klarensi", handle: "@klar", email: "klar@school.al", password: "demo" },
      { id: "u_hod", username: "Shef_departamenti", handle: "@hod", email: "hod@school.al", password: "demo" },
      { id: "u_fin", username: "Financa_zyra", handle: "@finance", email: "fin@school.al", password: "demo" },
      { id: "u_wh", username: "Magazina_kryesore", handle: "@warehouse", email: "wh@school.al", password: "demo" },
    ],
    storages: [
      {
        id: "st_atila",
        name: "Atila Electronics Lab",
        handle: "@atila123",
        ownerId: "u_klar",
        isPublic: true,
        deviceId: "SN-X100",
        paired: true,
        createdAt: now,
        members: {
          u_klar: { role: "Teacher", isAdmin: true, joinedAt: now },
          u_albi: { role: "Student", isAdmin: false, joinedAt: now },
          u_hod: { role: "HOD", isAdmin: false, joinedAt: now },
          u_fin: { role: "Finance", isAdmin: false, joinedAt: now },
          u_wh: { role: "Warehouse", isAdmin: false, joinedAt: now },
        },
        joinRequests: [],
        rows: [
          {
            id: "r_a", letter: "A", deletedAt: null,
            shelves: [
              { id: "sh_a1", coord: "A1", label: "Resistors 220Ω", quantity: 50, isOpen: true, deletedAt: null },
              { id: "sh_a2", coord: "A2", label: "LEDs Red", quantity: 120, isOpen: true, deletedAt: null },
              { id: "sh_a3", coord: "A3", label: "", quantity: 0, isOpen: false, deletedAt: null },
            ],
          },
        ],
        warehouses: [
          { id: "wh_main", name: "Main Warehouse", contactUserId: "u_wh" },
          { id: "wh_lab", name: "Lab B Annex", contactUserId: "u_wh" },
        ],
      },
      {
        id: "st_robotika",
        name: "Klubi i Robotikës",
        handle: "@rrobotikaHF",
        ownerId: "u_klar",
        isPublic: true,
        deviceId: null,
        paired: false,
        createdAt: now,
        members: {
          u_klar: { role: "Teacher", isAdmin: true, joinedAt: now },
        },
        joinRequests: [],
        rows: [],
        warehouses: [{ id: "wh_main", name: "Main Warehouse", contactUserId: "u_wh" }],
      },
      {
        id: "st_praktika",
        name: "Praktika Storage",
        handle: "@praktikaV4",
        ownerId: "u_albi",
        isPublic: true,
        deviceId: null,
        paired: false,
        createdAt: now,
        members: { u_albi: { role: "Teacher", isAdmin: true, joinedAt: now } },
        joinRequests: [],
        rows: [],
        warehouses: [],
      },
    ],
    orders: [],
    nextIds: { user: 100, storage: 100, order: 100, row: 100, shelf: 100, wh: 100 },
  };
}

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────
export function loadState() {
  try {
    const raw = typeof window !== "undefined" && window.localStorage?.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { /* fall through */ }
  return seedState();
}

export function saveState(state) {
  try {
    if (typeof window !== "undefined") window.localStorage?.setItem(STORE_KEY, JSON.stringify(state));
  } catch (_) { /* ignore quota errors */ }
}

export function resetState() {
  try {
    if (typeof window !== "undefined") window.localStorage?.removeItem(STORE_KEY);
  } catch (_) {}
  return seedState();
}

// ─── ID HELPERS ───────────────────────────────────────────────────────────────
export const newId = (kind, state) => {
  const n = (state.nextIds[kind] || 1) + 1;
  state.nextIds[kind] = n;
  return `${kind}_${n}_${Date.now().toString(36)}`;
};

// ─── DYNAMIC ROLE HELPERS (MVP §0 — never hardcode role strings in UI logic) ──
export function getMembership(storage, userId) {
  if (!storage || !userId) return null;
  return storage.members?.[userId] || null;
}

export function getRole(storage, userId) {
  return getMembership(storage, userId)?.role || null;
}

export function isAdmin(storage, userId) {
  return !!getMembership(storage, userId)?.isAdmin;
}

export function isOwner(storage, userId) {
  return storage?.ownerId === userId;
}

// Read-only roles per MVP §3: Student, HOD, Finance (act as approval bridge)
export function isReadOnly(role) {
  return role === "Student" || role === "HOD" || role === "Finance";
}

// Can the role mutate inventory (CRUD systems/drawers)? Per MVP §3 → Teacher only.
export function canEditInventory(role) {
  return role === "Teacher";
}

// What's the next pipeline status for a given role's approval action?
export function nextStatusAfterApproval(actorRole) {
  // Teacher approves student request → goes to HOD
  if (actorRole === "Teacher") return STATUS.PENDING_HOD;
  if (actorRole === "HOD") return STATUS.PENDING_FINANCE;
  if (actorRole === "Finance") return STATUS.PENDING_WAREHOUSE;
  if (actorRole === "Warehouse") return STATUS.COMPLETED;
  return null;
}

export function statusForRole(role) {
  if (role === "Teacher") return STATUS.PENDING_TEACHER;
  if (role === "HOD") return STATUS.PENDING_HOD;
  if (role === "Finance") return STATUS.PENDING_FINANCE;
  if (role === "Warehouse") return STATUS.PENDING_WAREHOUSE;
  return null;
}

// Does this user need to act on this order right now?
export function canActOnOrder(order, role) {
  if (!role) return false;
  return order.status === statusForRole(role);
}

// ─── PARSE SCANNED ID ─────────────────────────────────────────────────────────
// Per MVP §2: Universal Scanner parses IDs from QR codes or URLs (e.g. beex.io/id=123)
export function parseScanned(input) {
  if (!input) return null;
  const trimmed = input.trim();
  // URL pattern: beex.io/id=XXX  or  https://beex.io/?id=XXX
  const urlMatch = trimmed.match(/(?:[?&]|\/)id=([a-zA-Z0-9_\-]+)/);
  if (urlMatch) return urlMatch[1];
  // Bare ID (alphanumeric-ish)
  if (/^[a-zA-Z0-9_\-]{2,}$/.test(trimmed)) return trimmed;
  return null;
}

// ─── SOFT DELETE FILTERING ────────────────────────────────────────────────────
// Per MVP §5: deleted rows/drawers are retained for 30 days, hidden from UI.
const RETENTION_MS = SOFT_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function isAlive(item) {
  if (!item?.deletedAt) return true;
  return Date.now() - item.deletedAt < RETENTION_MS;
}

export function visibleRows(rows) {
  // Hide soft-deleted items from main views; keep purgeable in DB
  return (rows || []).filter((r) => !r.deletedAt && isAlive(r))
    .map((r) => ({ ...r, shelves: (r.shelves || []).filter((s) => !s.deletedAt && isAlive(s)) }));
}
