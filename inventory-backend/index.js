// BeexStorage v2.0 — Backend API
// Express + Prisma + Postgres (Supabase). Deployed on Render.
//
// Endpoints map to the frontend's data layer in src/data.js. The frontend
// owns the role/pipeline logic (per MVP §0), so this server is mostly a
// thin CRUD + aggregation layer with one safety lock: the storage owner
// cannot be demoted.

require('dotenv/config');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cors());

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

// ─── Helpers ────────────────────────────────────────────────────────────────
const ROLES = ['Student', 'Teacher', 'HOD', 'Finance', 'Warehouse'];
const STATUS = {
  PENDING_TEACHER: 'PENDING_TEACHER',
  PENDING_HOD: 'PENDING_HOD',
  PENDING_FINANCE: 'PENDING_FINANCE',
  PENDING_WAREHOUSE: 'PENDING_WAREHOUSE',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
};

// Reshape DB rows into the exact shape the frontend expects (matches
// `seedState()` in src/data.js so the swap from localStorage → API is
// invisible to components).
function reshapeStorage(s) {
  const members = {};
  for (const m of s.memberships || []) {
    members[m.userId] = {
      role: m.role,
      isAdmin: m.isAdmin,
      joinedAt: m.joinedAt?.getTime?.() ?? Date.now(),
    };
  }
  return {
    id: s.id,
    name: s.name,
    handle: s.handle,
    deviceId: s.deviceId,
    paired: s.paired,
    isPublic: s.isPublic,
    ownerId: s.ownerId,
    createdAt: s.createdAt?.getTime?.() ?? Date.now(),
    members,
    joinRequests: (s.joinRequests || [])
      .filter((r) => r.status === 'pending')
      .map((r) => ({
        userId: r.userId,
        requestedAt: r.requestedAt?.getTime?.() ?? Date.now(),
      })),
    rows: (s.rows || []).map((r) => ({
      id: r.id,
      letter: r.letter,
      deletedAt: r.deletedAt ? r.deletedAt.getTime() : null,
      shelves: (r.shelves || []).map((sh) => ({
        id: sh.id,
        coord: sh.coord,
        label: sh.label,
        quantity: sh.quantity,
        isOpen: sh.isOpen,
        deletedAt: sh.deletedAt ? sh.deletedAt.getTime() : null,
      })),
    })),
    warehouses: (s.warehouses || []).map((w) => ({
      id: w.id,
      name: w.name,
      contactUserId: w.contactUserId,
    })),
  };
}

function reshapeOrder(o) {
  return {
    id: o.id,
    storageId: o.storageId,
    requesterId: o.requesterId,
    requesterUsername: o.requester?.username,
    warehouseId: o.warehouseId,
    item: o.item,
    quantity: o.quantity,
    status: o.status,
    createdAt: o.createdAt?.getTime?.() ?? Date.now(),
    history: (o.events || []).map((e) => ({
      status: e.status,
      by: e.byUserId,
      at: e.at?.getTime?.() ?? Date.now(),
    })),
  };
}

function reshapeUser(u) {
  return { id: u.id, username: u.username, handle: u.handle, email: u.email };
}

const storageInclude = {
  memberships: true,
  joinRequests: true,
  rows: { include: { shelves: true } },
  warehouses: true,
};

const fail = (res, code, message) =>
  res.status(code).json({ success: false, message });

// ─── Health ─────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('BeexStorage Backend is Active!'));
app.get('/api/health', (_req, res) =>
  res.json({ ok: true, time: Date.now() }),
);

// ─── Auth ───────────────────────────────────────────────────────────────────
// Passwords stored as plain text for now to match the existing schema.
// Upgrade to bcrypt before public launch — see README.

app.post('/api/register', async (req, res) => {
  const { username, handle, email, password } = req.body || {};
  if (!username || !handle || !email || !password)
    return fail(res, 400, 'Missing required fields');
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  try {
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        handle: cleanHandle,
        email: email.trim(),
        password,
      },
    });
    res.json({ success: true, user: reshapeUser(user) });
  } catch (e) {
    if (e.code === 'P2002')
      return fail(res, 409, 'Username, handle, or email already taken');
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return fail(res, 400, 'Missing credentials');
  try {
    const user = await prisma.user.findFirst({
      where: { username: { equals: username.trim(), mode: 'insensitive' } },
    });
    if (!user || user.password !== password)
      return fail(res, 401, 'Invalid username or password');
    res.json({ success: true, user: reshapeUser(user) });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

// ─── Snapshot ───────────────────────────────────────────────────────────────
// Returns the entire app state. The frontend hits this on login + after
// any mutation it doesn't fully trust to update its local cache.
app.get('/api/state/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const [users, storages, orders] = await Promise.all([
      prisma.user.findMany(),
      prisma.storage.findMany({ include: storageInclude }),
      prisma.order.findMany({
        include: { events: true, requester: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const me = users.find((u) => u.id === userId);
    res.json({
      success: true,
      state: {
        users: users.map(reshapeUser),
        storages: storages.map(reshapeStorage),
        orders: orders.map(reshapeOrder),
      },
      currentUser: me ? reshapeUser(me) : null,
    });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

// ─── Profile ────────────────────────────────────────────────────────────────
app.put('/api/users/:id', async (req, res) => {
  const { username, handle, email } = req.body || {};
  try {
    const cleanHandle = handle?.startsWith('@') ? handle : `@${handle}`;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        username: username?.trim(),
        handle: cleanHandle,
        email: email?.trim(),
      },
    });
    res.json({ success: true, user: reshapeUser(user) });
  } catch (e) {
    if (e.code === 'P2002') return fail(res, 409, 'Username or handle taken');
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.put('/api/users/:id/password', async (req, res) => {
  const { current, next } = req.body || {};
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });
    if (!user) return fail(res, 404, 'User not found');
    if (user.password !== current)
      return fail(res, 401, 'Wrong current password');
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password: next },
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

// ─── Storages ───────────────────────────────────────────────────────────────
// Universal scanner: looks up by id/handle/deviceId. If no match, the
// caller becomes Owner+Teacher+Admin (MVP §4). Otherwise the caller joins
// as Student.
app.post('/api/scan', async (req, res) => {
  const { userId, scannedId } = req.body || {};
  if (!userId || !scannedId) return fail(res, 400, 'Missing fields');
  try {
    const cleanId = String(scannedId).replace(/^@/, '');
    let storage = await prisma.storage.findFirst({
      where: {
        OR: [
          { id: scannedId },
          { handle: `@${cleanId}` },
          { deviceId: cleanId },
        ],
      },
      include: storageInclude,
    });

    if (!storage) {
      storage = await prisma.storage.create({
        data: {
          name: `Storage ${cleanId}`,
          handle: `@${cleanId.toLowerCase()}`,
          deviceId: cleanId,
          paired: true,
          ownerId: userId,
          memberships: {
            create: { userId, role: 'Teacher', isAdmin: true },
          },
        },
        include: storageInclude,
      });
      return res.json({
        success: true,
        action: 'created',
        storage: reshapeStorage(storage),
      });
    }

    const existing = storage.memberships.find((m) => m.userId === userId);
    if (existing) {
      return res.json({
        success: true,
        action: 'opened',
        storage: reshapeStorage(storage),
      });
    }

    await prisma.membership.create({
      data: { userId, storageId: storage.id, role: 'Student' },
    });
    if (!storage.deviceId) {
      await prisma.storage.update({
        where: { id: storage.id },
        data: { deviceId: cleanId, paired: true },
      });
    }
    const refreshed = await prisma.storage.findUnique({
      where: { id: storage.id },
      include: storageInclude,
    });
    res.json({
      success: true,
      action: 'joined',
      storage: reshapeStorage(refreshed),
    });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.get('/api/storages/public', async (req, res) => {
  try {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    const storages = await prisma.storage.findMany({
      where: { isPublic: true },
      include: storageInclude,
    });
    let result = storages.map(reshapeStorage);
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.handle?.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      );
    }
    res.json({ success: true, storages: result });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.post('/api/storages/:id/join-request', async (req, res) => {
  const { userId } = req.body || {};
  try {
    await prisma.joinRequest.upsert({
      where: { userId_storageId: { userId, storageId: req.params.id } },
      update: { status: 'pending', requestedAt: new Date() },
      create: { userId, storageId: req.params.id },
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

// ─── Inventory CRUD ─────────────────────────────────────────────────────────
// Authority is enforced on the frontend (canEditInventory + isAdmin).
// When you add real auth tokens, gate these on the server too.

app.post('/api/storages/:storageId/rows', async (req, res) => {
  try {
    const live = await prisma.row.count({
      where: { storageId: req.params.storageId, deletedAt: null },
    });
    const letter = String.fromCharCode(65 + live);
    const row = await prisma.row.create({
      data: { storageId: req.params.storageId, letter },
    });
    res.json({ success: true, row });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.delete('/api/rows/:id', async (req, res) => {
  try {
    await prisma.row.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.post('/api/rows/:rowId/shelves', async (req, res) => {
  try {
    const row = await prisma.row.findUnique({
      where: { id: req.params.rowId },
      include: { shelves: true },
    });
    if (!row) return fail(res, 404, 'Row not found');
    const live = row.shelves.filter((s) => !s.deletedAt);
    const nums = live.map((s) => parseInt(s.coord.substring(1)) || 0);
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    const shelf = await prisma.shelf.create({
      data: { rowId: row.id, coord: `${row.letter}${next}` },
    });
    res.json({ success: true, shelf });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.put('/api/shelves/:id', async (req, res) => {
  const { label, quantity, isOpen } = req.body || {};
  try {
    const data = {};
    if (label !== undefined) data.label = label;
    if (quantity !== undefined)
      data.quantity = Math.max(0, parseInt(quantity, 10) || 0);
    if (isOpen !== undefined) data.isOpen = !!isOpen;
    const shelf = await prisma.shelf.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, shelf });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.delete('/api/shelves/:id', async (req, res) => {
  try {
    await prisma.shelf.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

// ─── Orders ─────────────────────────────────────────────────────────────────
app.post('/api/orders', async (req, res) => {
  const { storageId, requesterId, item, quantity, status } = req.body || {};
  if (!storageId || !requesterId || !item || !quantity)
    return fail(res, 400, 'Missing fields');
  try {
    const order = await prisma.order.create({
      data: {
        storageId,
        requesterId,
        item: item.trim(),
        quantity: String(quantity),
        status: status || STATUS.PENDING_HOD,
        events: {
          create: [
            { status: status || STATUS.PENDING_HOD, byUserId: requesterId },
          ],
        },
      },
      include: { events: true, requester: true },
    });
    res.json({ success: true, order: reshapeOrder(order) });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.put('/api/orders/:id', async (req, res) => {
  const { status, warehouseId, byUserId } = req.body || {};
  try {
    const data = {};
    if (status) data.status = status;
    if (warehouseId !== undefined) data.warehouseId = warehouseId || null;
    await prisma.order.update({ where: { id: req.params.id }, data });
    if (status && byUserId) {
      await prisma.orderEvent.create({
        data: { orderId: req.params.id, status, byUserId },
      });
    }
    const refreshed = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { events: true, requester: true },
    });
    res.json({ success: true, order: reshapeOrder(refreshed) });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

// ─── Hierarchy / Admin ──────────────────────────────────────────────────────
app.put('/api/storages/:storageId/members/:userId/role', async (req, res) => {
  const { role } = req.body || {};
  if (!ROLES.includes(role)) return fail(res, 400, 'Invalid role');
  try {
    const storage = await prisma.storage.findUnique({
      where: { id: req.params.storageId },
    });
    if (!storage) return fail(res, 404, 'Storage not found');
    if (storage.ownerId === req.params.userId)
      return fail(res, 403, 'Owner cannot be demoted');
    const m = await prisma.membership.update({
      where: {
        userId_storageId: {
          userId: req.params.userId,
          storageId: req.params.storageId,
        },
      },
      data: { role },
    });
    res.json({ success: true, membership: m });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

app.put('/api/storages/:storageId/members/:userId/admin', async (req, res) => {
  const { isAdmin } = req.body || {};
  try {
    const storage = await prisma.storage.findUnique({
      where: { id: req.params.storageId },
    });
    if (!storage) return fail(res, 404, 'Storage not found');
    if (storage.ownerId === req.params.userId)
      return fail(res, 403, 'Owner is permanently Admin');
    const m = await prisma.membership.update({
      where: {
        userId_storageId: {
          userId: req.params.userId,
          storageId: req.params.storageId,
        },
      },
      data: { isAdmin: !!isAdmin },
    });
    res.json({ success: true, membership: m });
  } catch (e) {
    console.error(e);
    fail(res, 500, 'Server error');
  }
});

// ─── Seed (idempotent) ──────────────────────────────────────────────────────
// Hit POST /api/seed once after deploy to populate demo data.
app.post('/api/seed', async (_req, res) => {
  try {
    const seedUsers = [
      { id: 'u_admin', username: 'adminx', handle: '@adminx', email: 'admin@beex.io', password: '12345' },
      { id: 'u_albi', username: 'Albi_student', handle: '@albi', email: 'albi@school.al', password: 'demo' },
      { id: 'u_klar', username: 'Profesor_Klarensi', handle: '@klar', email: 'klar@school.al', password: 'demo' },
      { id: 'u_hod', username: 'Shef_departamenti', handle: '@hod', email: 'hod@school.al', password: 'demo' },
      { id: 'u_fin', username: 'Financa_zyra', handle: '@finance', email: 'fin@school.al', password: 'demo' },
      { id: 'u_wh', username: 'Magazina_kryesore', handle: '@warehouse', email: 'wh@school.al', password: 'demo' },
    ];
    for (const u of seedUsers) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { username: u.username, handle: u.handle, email: u.email },
        create: u,
      });
    }
    await prisma.storage.upsert({
      where: { id: 'st_atila' },
      update: {},
      create: {
        id: 'st_atila',
        name: 'Atila Electronics Lab',
        handle: '@atila123',
        deviceId: 'SN-X100',
        paired: true,
        isPublic: true,
        ownerId: 'u_klar',
        memberships: {
          create: [
            { userId: 'u_klar', role: 'Teacher', isAdmin: true },
            { userId: 'u_albi', role: 'Student' },
            { userId: 'u_hod', role: 'HOD' },
            { userId: 'u_fin', role: 'Finance' },
            { userId: 'u_wh', role: 'Warehouse' },
          ],
        },
        rows: {
          create: [
            {
              letter: 'A',
              shelves: {
                create: [
                  { coord: 'A1', label: 'Resistors 220Ω', quantity: 50, isOpen: true },
                  { coord: 'A2', label: 'LEDs Red', quantity: 120, isOpen: true },
                  { coord: 'A3' },
                ],
              },
            },
          ],
        },
        warehouses: {
          create: [
            { name: 'Main Warehouse', contactUserId: 'u_wh' },
            { name: 'Lab B Annex', contactUserId: 'u_wh' },
          ],
        },
      },
    });
    await prisma.storage.upsert({
      where: { id: 'st_robotika' },
      update: {},
      create: {
        id: 'st_robotika',
        name: 'Klubi i Robotikës',
        handle: '@rrobotikaHF',
        isPublic: true,
        ownerId: 'u_klar',
        memberships: { create: [{ userId: 'u_klar', role: 'Teacher', isAdmin: true }] },
      },
    });
    await prisma.storage.upsert({
      where: { id: 'st_praktika' },
      update: {},
      create: {
        id: 'st_praktika',
        name: 'Praktika Storage',
        handle: '@praktikaV4',
        isPublic: true,
        ownerId: 'u_albi',
        memberships: { create: [{ userId: 'u_albi', role: 'Teacher', isAdmin: true }] },
      },
    });
    res.json({ success: true, message: 'Seed complete' });
  } catch (e) {
    console.error(e);
    fail(res, 500, e.message || 'Seed failed');
  }
});

// ─── Boot ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`BeexStorage backend listening on :${PORT}`),
);
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
