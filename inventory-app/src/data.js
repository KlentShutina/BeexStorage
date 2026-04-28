// ─── DATA LAYER (Mock DB) ─────────────────────────────────────────────────────
export const API = "https://beex-storage-backend.onrender.com/api";

export const ROLES = ["Student", "Teacher", "HOD", "Finance", "Warehouse"];
export const ORDER_PIPELINE = ["Teacher", "HOD", "Finance", "Warehouse"];

export const STATUS = {
  PENDING_TEACHER: "PENDING_TEACHER",
  PENDING_HOD: "PENDING_HOD",
  PENDING_FINANCE: "PENDING_FINANCE",
  PENDING_WAREHOUSE: "PENDING_WAREHOUSE",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
};

export const SOFT_DELETE_RETENTION_DAYS = 30;
export const DEV_BYPASS = { username: "adminx", password: "12345" };

const STORE_KEY = "beex.state.v4";

function seedState() {
  const now = Date.now();
  return {
    users: [
      { id: "u_admin", username: "adminx",              handle: "@adminx",    email: "admin@beex.io",    password: "12345" },
      { id: "u_albi",  username: "Albi_student",         handle: "@albi",      email: "albi@school.al",   password: "demo"  },
      { id: "u_klar",  username: "Profesor_Klarensi",    handle: "@klar",      email: "klar@school.al",   password: "demo"  },
      { id: "u_hod",   username: "Shef_departamenti",    handle: "@hod",       email: "hod@school.al",    password: "demo"  },
      { id: "u_fin",   username: "Financa_zyra",         handle: "@finance",   email: "fin@school.al",    password: "demo"  },
      { id: "u_wh",    username: "Magazina_kryesore",    handle: "@warehouse", email: "wh@school.al",     password: "demo"  },
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
          // u_admin is Teacher+Admin in every storage so the dev bypass shows all features
          u_admin: { role: "Teacher", isAdmin: true,  joinedAt: now },
          u_klar:  { role: "Teacher", isAdmin: true,  joinedAt: now },
          u_albi:  { role: "Student", isAdmin: false, joinedAt: now },
          u_hod:   { role: "HOD",     isAdmin: false, joinedAt: now },
          u_fin:   { role: "Finance", isAdmin: false, joinedAt: now },
          u_wh:    { role: "Warehouse", isAdmin: false, joinedAt: now },
        },
        joinRequests: [],
        rows: [
          {
            id: "r_a", letter: "A", deletedAt: null,
            shelves: [
              { id: "sh_a1", coord: "A1", label: "Resistors 220Ω", quantity: 50,  isOpen: true,  deletedAt: null },
              { id: "sh_a2", coord: "A2", label: "LEDs Red",        quantity: 120, isOpen: true,  deletedAt: null },
              { id: "sh_a3", coord: "A3", label: "Capacitors 10µF", quantity: 30,  isOpen: false, deletedAt: null },
              { id: "sh_a4", coord: "A4", label: "",                quantity: 0,   isOpen: false, deletedAt: null },
            ],
          },
          {
            id: "r_b", letter: "B", deletedAt: null,
            shelves: [
              { id: "sh_b1", coord: "B1", label: "Arduino Uno",  quantity: 8,  isOpen: true,  deletedAt: null },
              { id: "sh_b2", coord: "B2", label: "Jumper Wires", quantity: 200, isOpen: false, deletedAt: null },
            ],
          },
        ],
        warehouses: [
          { id: "wh_main", name: "Main Warehouse",  contactUserId: "u_wh" },
          { id: "wh_lab",  name: "Lab B Annex",     contactUserId: "u_wh" },
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
          u_admin: { role: "Teacher", isAdmin: true,  joinedAt: now },
          u_klar:  { role: "Teacher", isAdmin: true,  joinedAt: now },
        },
        joinRequests: [],
        rows: [],
        warehouses: [{ id: "wh_r1", name: "Main Warehouse", contactUserId: "u_wh" }],
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
        members: {
          u_admin: { role: "Teacher", isAdmin: true,  joinedAt: now },
          u_albi:  { role: "Teacher", isAdmin: true,  joinedAt: now },
        },
        joinRequests: [],
        rows: [],
        warehouses: [],
      },
    ],
    // Seed a few orders so the Orders tab is not empty for demo
    orders: [
      {
        id: "ord_1",
        storageId: "st_atila",
        item: "Arduino Mega",
        quantity: "3",
        status: STATUS.PENDING_TEACHER,
        requesterId: "u_albi",
        requesterUsername: "Albi_student",
        warehouseId: null,
        createdAt: now - 3600000,
        history: [{ status: STATUS.PENDING_TEACHER, by: "u_albi", at: now - 3600000 }],
      },
      {
        id: "ord_2",
        storageId: "st_atila",
        item: "Soldering Iron",
        quantity: "2",
        status: STATUS.PENDING_HOD,
        requesterId: "u_albi",
        requesterUsername: "Albi_student",
        warehouseId: "wh_main",
        createdAt: now - 7200000,
        history: [
          { status: STATUS.PENDING_TEACHER, by: "u_albi",  at: now - 7200000 },
          { status: STATUS.PENDING_HOD,     by: "u_klar",  at: now - 3600000 },
        ],
      },
      {
        id: "ord_3",
        storageId: "st_atila",
        item: "Breadboards",
        quantity: "10",
        status: STATUS.COMPLETED,
        requesterId: "u_albi",
        requesterUsername: "Albi_student",
        warehouseId: "wh_main",
        createdAt: now - 86400000,
        history: [
          { status: STATUS.PENDING_TEACHER,   by: "u_albi", at: now - 86400000 },
          { status: STATUS.PENDING_HOD,       by: "u_klar", at: now - 72000000 },
          { status: STATUS.PENDING_FINANCE,   by: "u_hod",  at: now - 57600000 },
          { status: STATUS.PENDING_WAREHOUSE, by: "u_fin",  at: now - 43200000 },
          { status: STATUS.COMPLETED,         by: "u_wh",   at: now - 28800000 },
        ],
      },
    ],
    nextIds: { user: 100, storage: 100, order: 100, row: 100, shelf: 100, wh: 100 },
  };
}

export function loadState() {
  try {
    const raw = typeof window !== "undefined" && window.localStorage?.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return seedState();
}

export function saveState(state) {
  try {
    if (typeof window !== "undefined") window.localStorage?.setItem(STORE_KEY, JSON.stringify(state));
  } catch (_) {}
}

export function resetState() {
  try {
    if (typeof window !== "undefined") window.localStorage?.removeItem(STORE_KEY);
  } catch (_) {}
  return seedState();
}

// Call this in browser console to wipe stale data and reload fresh seed:
// import { resetAndReseed } from "./data"; resetAndReseed();
export function resetAndReseed() {
  if (typeof window !== "undefined") {
    window.localStorage?.removeItem(STORE_KEY);
    window.location.reload();
  }
}

export const newId = (kind, state) => {
  const n = (state.nextIds[kind] || 1) + 1;
  state.nextIds[kind] = n;
  return `${kind}_${n}_${Date.now().toString(36)}`;
};

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

export function isReadOnly(role) {
  return role === "Student" || role === "HOD" || role === "Finance";
}

export function canEditInventory(role) {
  return role === "Teacher";
}

export function nextStatusAfterApproval(actorRole) {
  if (actorRole === "Teacher")   return STATUS.PENDING_HOD;
  if (actorRole === "HOD")       return STATUS.PENDING_FINANCE;
  if (actorRole === "Finance")   return STATUS.PENDING_WAREHOUSE;
  if (actorRole === "Warehouse") return STATUS.COMPLETED;
  return null;
}

export function statusForRole(role) {
  if (role === "Teacher")   return STATUS.PENDING_TEACHER;
  if (role === "HOD")       return STATUS.PENDING_HOD;
  if (role === "Finance")   return STATUS.PENDING_FINANCE;
  if (role === "Warehouse") return STATUS.PENDING_WAREHOUSE;
  return null;
}

export function canActOnOrder(order, role) {
  if (!role) return false;
  return order.status === statusForRole(role);
}

export function parseScanned(input) {
  if (!input) return null;
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/(?:[?&]|\/)id=([a-zA-Z0-9_\-]+)/);
  if (urlMatch) return urlMatch[1];
  if (/^[a-zA-Z0-9_\-]{2,}$/.test(trimmed)) return trimmed;
  return null;
}

const RETENTION_MS = SOFT_DELETE_RETENTION_DAYS * 24 * 60 * 60 * 1000;

export function isAlive(item) {
  if (!item?.deletedAt) return true;
  return Date.now() - item.deletedAt < RETENTION_MS;
}

export function visibleRows(rows) {
  return (rows || [])
    .filter((r) => !r.deletedAt && isAlive(r))
    .map((r) => ({ ...r, shelves: (r.shelves || []).filter((s) => !s.deletedAt && isAlive(s)) }));
}