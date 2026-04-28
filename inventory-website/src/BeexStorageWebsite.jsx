import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import logo from "./assets/logo.png";
import { T } from "./i18n";
import {
  loadState,
  saveState,
  newId,
  parseScanned,
  visibleRows,
  getRole,
  getMembership,
  isAdmin,
  isOwner,
  isReadOnly,
  canEditInventory,
  canActOnOrder,
  nextStatusAfterApproval,
  ROLES,
  STATUS,
  DEV_BYPASS,
} from "./data";

/* ─── Contexts ─────────────────────────────────────────────────────────────── */
const LangContext = createContext(null);
const useLang = () => useContext(LangContext);
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

/* ─── Toast hook ───────────────────────────────────────────────────────────── */
function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up rounded-full bg-beex-ink px-5 py-3 text-sm font-semibold text-white shadow-2xl">
      {msg}
    </div>
  );
}
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => setMsg(m), []);
  const el = msg ? <Toast msg={msg} onDone={() => setMsg(null)} /> : null;
  return [show, el];
}

/* ─── Reusable atoms ───────────────────────────────────────────────────────── */
function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-beex-500" : "bg-zinc-300"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function StatusBadge({ status }) {
  const { t } = useLang();
  const map = {
    [STATUS.PENDING_TEACHER]: { label: t.pendingTeacher, cls: "badge-amber" },
    [STATUS.PENDING_HOD]: { label: t.pendingHOD, cls: "badge-amber" },
    [STATUS.PENDING_FINANCE]: { label: t.pendingFinance, cls: "badge-amber" },
    [STATUS.PENDING_WAREHOUSE]: { label: t.pendingWarehouse, cls: "badge-blue" },
    [STATUS.COMPLETED]: { label: t.completed, cls: "badge-emerald" },
    [STATUS.REJECTED]: { label: t.rejected, cls: "badge-rose" },
  };
  const v = map[status] || { label: status, cls: "badge-zinc" };
  return <span className={`pill ${v.cls}`}>{v.label}</span>;
}

function RolePill({ role, owner }) {
  const { t } = useLang();
  if (owner) return <span className="pill pill-owner">★ {t.youAreOwner}</span>;
  return <span className="pill pill-role">{role}</span>;
}

function Modal({ open, onClose, title, children, maxWidth = "max-w-md" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} rounded-2xl p-6 shadow-2xl animate-slide-up`}
        style={{ background: "var(--c-surface)", color: "var(--c-text)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="mb-4 text-lg font-bold text-ink dark:text-white">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/* ─── Landing Page ─────────────────────────────────────────────────────────── */
function LandingScreen({ onLogin, onSignup }) {
  const { t } = useLang();
  return (
    <div className="min-h-screen" style={{ background: "var(--c-bg)" }}>
      {/* Top nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <img src={logo} alt="BeexStorage" className="h-10 w-10 rounded-xl" />
          <span className="text-lg font-extrabold tracking-tight text-ink">
            {t.appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogin} className="btn-ghost">
            {t.signIn}
          </button>
          <button onClick={onSignup} className="btn-primary">
            {t.getStarted}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero pb-20 pt-14 lg:pt-20">
          <div className="mx-auto max-w-5xl px-6 text-center lg:px-12">
            <div className="mx-auto mb-8 inline-block animate-float">
              <img
                src={logo}
                alt=""
                className="h-24 w-24 rounded-3xl shadow-xl ring-4 ring-white/40 lg:h-32 lg:w-32"
              />
            </div>
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-beex-ink lg:text-6xl">
              {t.welcome}
            </h1>
            <p className="text-balance mx-auto mt-5 max-w-2xl text-lg font-medium text-beex-ink/80 lg:text-xl">
              {t.heroTagline}
            </p>
            <p className="text-balance mx-auto mt-3 max-w-2xl text-sm text-beex-ink/70 lg:text-base">
              {t.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button onClick={onSignup} className="btn-primary px-6 py-3.5 text-base">
                {t.getStarted} →
              </button>
              <button onClick={onLogin} className="btn-secondary px-6 py-3.5 text-base">
                {t.signIn}
              </button>
            </div>
            <p className="mt-4 text-xs font-semibold text-beex-ink/60">
              Demo: <span className="font-mono">adminx</span> /{" "}
              <span className="font-mono">12345</span>
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24" style={{ background: "var(--c-surface)" }}>
        <div className="mx-auto max-w-6xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              {t.productHeading}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: "📷", title: t.feature1Title, desc: t.feature1Desc },
              { icon: "🔁", title: t.feature2Title, desc: t.feature2Desc },
              { icon: "🛠", title: t.feature3Title, desc: t.feature3Desc },
            ].map((f, i) => (
              <div key={i} className="card p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-beex-500 to-beex-400 text-3xl shadow-md">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8" style={{ borderColor: "var(--c-border)", background: "var(--c-surface-alt)" }}>
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-ink-muted lg:px-12">
          {t.footerLine}
        </div>
      </footer>
    </div>
  );
}

/* ─── Auth: Login ──────────────────────────────────────────────────────────── */
function LoginScreen({ onLogin, onGoSignup, onBack }) {
  const { t } = useLang();
  const { state } = useApp();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    if (!u.trim() || !p.trim()) return setErr(t.fieldRequired);
    setLoading(true);
    setErr("");
    setTimeout(() => {
      if (u.trim() === DEV_BYPASS.username && p === DEV_BYPASS.password) {
        const admin =
          state.users.find((x) => x.username === DEV_BYPASS.username) || {
            id: "u_admin",
            username: "adminx",
            handle: "@adminx",
            email: "admin@beex.io",
          };
        onLogin(admin);
        return;
      }
      const user = state.users.find(
        (x) => x.username.toLowerCase() === u.trim().toLowerCase()
      );
      if (!user || user.password !== p) {
        setErr(t.loginError);
        setLoading(false);
        return;
      }
      onLogin(user);
    }, 350);
  };

  return (
    <AuthShell onBack={onBack}>
      <div className="mb-6 flex items-center gap-3">
        <img src={logo} alt="" className="h-12 w-12 rounded-xl" />
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t.login}</h1>
          <p className="text-sm text-ink-muted">{t.welcomeBack} 👋</p>
        </div>
      </div>
      <div className="mb-4 rounded-xl bg-beex-50 p-3 text-xs font-semibold text-ink">
        Demo: <span className="font-mono">adminx</span> /{" "}
        <span className="font-mono">12345</span>
      </div>
      {err && (
        <div className="mb-3 rounded-lg alert-error px-3 py-2 text-sm font-semibold">
          {err}
        </div>
      )}
      <input
        className="input-base mb-3"
        placeholder={t.username}
        value={u}
        onChange={(e) => setU(e.target.value)}
        autoCapitalize="none"
      />
      <input
        className="input-base mb-4"
        placeholder={t.password}
        type="password"
        value={p}
        onChange={(e) => setP(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handle()}
      />
      <button
        className="btn-primary w-full py-3.5"
        disabled={loading}
        onClick={handle}
      >
        {loading ? "…" : t.login}
      </button>
      <button
        onClick={onGoSignup}
        className="mt-4 w-full text-sm font-semibold text-beex-600 hover:underline"
      >
        {t.noAccount}
      </button>
    </AuthShell>
  );
}

/* ─── Auth: Signup ─────────────────────────────────────────────────────────── */
function SignupScreen({ onGoLogin, onBack }) {
  const { t } = useLang();
  const { state, dispatch } = useApp();
  const [f, setF] = useState({
    username: "",
    handle: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, toastEl] = useToast();
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const handle = () => {
    setErr("");
    const isBypass =
      f.username.trim() === DEV_BYPASS.username && f.password === DEV_BYPASS.password;
    if (!isBypass) {
      if (
        !f.username.trim() ||
        !f.handle.trim() ||
        !f.email.trim() ||
        !f.password ||
        !f.confirm
      )
        return setErr(t.fieldRequired);
      if (f.password !== f.confirm) return setErr(t.passwordMismatch);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr(t.invalidEmail);
      if (
        state.users.some(
          (u) => u.username.toLowerCase() === f.username.trim().toLowerCase()
        )
      )
        return setErr(t.usernameTaken);
      const ch = f.handle.startsWith("@") ? f.handle : `@${f.handle}`;
      if (state.users.some((u) => u.handle.toLowerCase() === ch.toLowerCase()))
        return setErr(t.handleTaken);
    }
    setLoading(true);
    setTimeout(() => {
      dispatch((s) => {
        const id = newId("user", s);
        const ch = f.handle.startsWith("@") ? f.handle : `@${f.handle || f.username}`;
        s.users.push({
          id,
          username: f.username.trim(),
          handle: ch,
          email: f.email.trim(),
          password: f.password,
        });
      });
      showToast(t.accountCreated);
      setLoading(false);
      setTimeout(onGoLogin, 1100);
    }, 400);
  };

  return (
    <AuthShell onBack={onBack}>
      {toastEl}
      <div className="mb-6 flex items-center gap-3">
        <img src={logo} alt="" className="h-12 w-12 rounded-xl" />
        <div>
          <h1 className="text-2xl font-extrabold text-ink">{t.signup}</h1>
          <p className="text-sm text-ink-muted">{t.tagline}</p>
        </div>
      </div>
      {err && (
        <div className="mb-3 rounded-lg alert-error px-3 py-2 text-sm font-semibold">
          {err}
        </div>
      )}
      <input
        className="input-base mb-3"
        placeholder={t.username}
        value={f.username}
        onChange={(e) => set("username", e.target.value)}
      />
      <input
        className="input-base mb-3"
        placeholder={t.handle}
        value={f.handle}
        onChange={(e) => set("handle", e.target.value)}
      />
      <input
        className="input-base mb-3"
        placeholder={t.email}
        type="email"
        value={f.email}
        onChange={(e) => set("email", e.target.value)}
      />
      <input
        className="input-base mb-3"
        placeholder={t.password}
        type="password"
        value={f.password}
        onChange={(e) => set("password", e.target.value)}
      />
      <input
        className="input-base mb-4"
        placeholder={t.confirmPassword}
        type="password"
        value={f.confirm}
        onChange={(e) => set("confirm", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !loading && handle()}
      />
      <button
        className="btn-primary w-full py-3.5"
        disabled={loading}
        onClick={handle}
      >
        {loading ? "…" : t.register}
      </button>
      <button
        onClick={onGoLogin}
        className="mt-4 w-full text-sm font-semibold text-beex-600 hover:underline"
      >
        {t.hasAccount}
      </button>
    </AuthShell>
  );
}

function AuthShell({ children, onBack }) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      <div className="px-6 py-4 lg:px-12">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-xl bg-white/40 px-4 py-2 text-sm font-semibold text-beex-ink backdrop-blur transition-colors hover:bg-white/60"
          >
            ← Home
          </button>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl p-8 shadow-2xl" style={{ background: "var(--c-surface)", color: "var(--c-text)", border: "1px solid var(--c-border)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ─── Inventory tab ────────────────────────────────────────────────────────── */
function InventoryTab() {
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const [activeId, setActiveId] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [showToast, toastEl] = useToast();

  const myStorages = useMemo(
    () => state.storages.filter((s) => s.members?.[currentUser.id]),
    [state.storages, currentUser.id]
  );
  const cur = state.storages.find((s) => s.id === activeId);

  const performScan = (raw) => {
    setScanError("");
    const id = parseScanned(raw);
    if (!id) return setScanError(t.scannedNotFound);
    setScanning(true);
    setTimeout(() => {
      const found = state.storages.find(
        (s) =>
          s.id === id ||
          s.handle?.replace("@", "") === id.replace("@", "") ||
          s.deviceId === id
      );
      if (!found) {
        dispatch((s) => {
          const sid = newId("storage", s);
          s.storages.push({
            id: sid,
            name: `Storage ${id}`,
            handle: `@${id.toLowerCase()}`,
            ownerId: currentUser.id,
            isPublic: false,
            deviceId: id,
            paired: true,
            createdAt: Date.now(),
            members: {
              [currentUser.id]: { role: "Teacher", isAdmin: true, joinedAt: Date.now() },
            },
            joinRequests: [],
            rows: [],
            warehouses: [],
          });
        });
        showToast(t.scannedSuccess);
      } else if (found.members?.[currentUser.id]) {
        setActiveId(found.id);
        showToast(t.scannedSuccess);
      } else {
        dispatch((s) => {
          const tgt = s.storages.find((x) => x.id === found.id);
          if (tgt) {
            tgt.members[currentUser.id] = {
              role: "Student",
              isAdmin: false,
              joinedAt: Date.now(),
            };
            tgt.paired = true;
            if (!tgt.deviceId) tgt.deviceId = id;
          }
        });
        showToast(t.scannedSuccess);
      }
      setScanning(false);
      setScanOpen(false);
      setScanInput("");
    }, 1000);
  };

  if (cur) return <StorageDetail storage={cur} onBack={() => setActiveId(null)} />;

  return (
    <div className="animate-fade-in">
      {toastEl}
      <PageHeader
        title={t.systems}
        subtitle={`${currentUser.handle} · ${myStorages.length} ${t.storages}`}
        action={
          <button onClick={() => setScanOpen(true)} className="btn-primary">
            ⌗ {t.scanToAdd}
          </button>
        }
      />
      {myStorages.length === 0 ? (
        <EmptyState icon="📦" text={t.inventoryEmpty} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {myStorages.map((inv) => {
            const m = getMembership(inv, currentUser.id);
            const owner = isOwner(inv, currentUser.id);
            return (
              <button
                key={inv.id}
                onClick={() => setActiveId(inv.id)}
                className="card group flex items-center gap-4 p-5 text-left"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-beex-500 to-beex-400 text-2xl shadow-md transition-transform group-hover:scale-105">
                  📦
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-ink">{inv.name}</div>
                  <div className="truncate text-xs text-ink-muted">{inv.handle}</div>
                  <div className="mt-1 truncate text-xs text-ink-dim">
                    {inv.paired ? `✓ ${t.connected}: ${inv.deviceId}` : t.disconnected}
                  </div>
                </div>
                <RolePill role={m?.role} owner={owner} />
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={scanOpen}
        onClose={() => !scanning && setScanOpen(false)}
        title={t.scannerTitle}
      >
        <div className="mb-4 flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-beex-50 to-beex-100 text-6xl">
          📷
        </div>
        <p className="mb-3 text-center text-sm text-ink-muted">{t.scannerHint}</p>
        {scanError && (
          <div className="mb-3 rounded-lg alert-error px-3 py-2 text-sm font-semibold">
            {scanError}
          </div>
        )}
        <input
          className="input-base mb-3"
          placeholder={t.manualIdPlaceholder}
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && performScan(scanInput)}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setScanOpen(false)}
            className="btn-secondary flex-1"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => performScan(scanInput || "DEMO-NEW-ID")}
            className="btn-primary flex-1"
          >
            {t.confirmScan}
          </button>
        </div>
      </Modal>

      {scanning && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-beex-500" />
          <p className="mt-4 font-semibold text-white">{t.scanning}</p>
        </div>
      )}
    </div>
  );
}

/* ─── Storage detail ───────────────────────────────────────────────────────── */
function StorageDetail({ storage, onBack }) {
  const { t } = useLang();
  const { dispatch, currentUser } = useApp();
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [qtyModal, setQtyModal] = useState(false);
  const [activeShelf, setActiveShelf] = useState(null);
  const [tempLabel, setTempLabel] = useState("");
  const [tempQty, setTempQty] = useState("0");
  const [confirm, setConfirm] = useState(null);

  const role = getRole(storage, currentUser.id);
  const canEdit = canEditInventory(role) || isAdmin(storage, currentUser.id);
  const rows = visibleRows(storage.rows);

  const addRow = () =>
    dispatch((s) => {
      const tgt = s.storages.find((x) => x.id === storage.id);
      if (!tgt) return;
      const live = (tgt.rows || []).filter((r) => !r.deletedAt);
      const letter = String.fromCharCode(65 + live.length);
      const id = newId("row", s);
      tgt.rows.push({ id, letter, shelves: [], deletedAt: null });
      setSelectedRowId(id);
    });

  const removeRow = () => {
    if (!selectedRowId) return;
    const r = rows.find((x) => x.id === selectedRowId);
    if (!r) return;
    setConfirm({
      title: t.deleteRow,
      msg: t.deleteRowMsg.replace("{name}", r.letter),
      onConfirm: () => {
        dispatch((s) => {
          const tgt = s.storages.find((x) => x.id === storage.id);
          const row = tgt?.rows.find((x) => x.id === selectedRowId);
          if (row) row.deletedAt = Date.now();
        });
        setSelectedRowId(null);
        setConfirm(null);
      },
    });
  };

  const addShelf = () => {
    if (!selectedRowId) return;
    dispatch((s) => {
      const tgt = s.storages.find((x) => x.id === storage.id);
      const row = tgt?.rows.find((x) => x.id === selectedRowId);
      if (!row) return;
      const live = (row.shelves || []).filter((sh) => !sh.deletedAt);
      const nums = live.map((sh) => parseInt(sh.coord.substring(1)) || 0);
      const next = nums.length ? Math.max(...nums) + 1 : 1;
      row.shelves.push({
        id: newId("shelf", s),
        coord: `${row.letter}${next}`,
        label: "",
        quantity: 0,
        isOpen: false,
        deletedAt: null,
      });
    });
  };

  const tapShelf = (rowId, shelf) => {
    if (isEdit && canEdit) {
      setActiveShelf({ rowId, shelfId: shelf.id });
      setTempLabel(shelf.label || "");
      setTempQty(String(shelf.quantity || 0));
      setQtyModal(true);
    } else if (canEdit) {
      dispatch((s) => {
        const tgt = s.storages.find((x) => x.id === storage.id);
        const row = tgt?.rows.find((x) => x.id === rowId);
        const sh = row?.shelves.find((x) => x.id === shelf.id);
        if (sh) sh.isOpen = !sh.isOpen;
      });
    }
  };

  const saveShelf = () => {
    if (!activeShelf) return;
    dispatch((s) => {
      const tgt = s.storages.find((x) => x.id === storage.id);
      const row = tgt?.rows.find((x) => x.id === activeShelf.rowId);
      const sh = row?.shelves.find((x) => x.id === activeShelf.shelfId);
      if (sh) {
        sh.label = tempLabel.trim();
        sh.quantity = Math.max(0, parseInt(tempQty, 10) || 0);
      }
    });
    setQtyModal(false);
  };

  const removeShelf = (rowId, shelfId, coord) => {
    setConfirm({
      title: t.deleteRow,
      msg: t.deleteShelfMsg.replace("{coord}", coord),
      onConfirm: () => {
        dispatch((s) => {
          const tgt = s.storages.find((x) => x.id === storage.id);
          const row = tgt?.rows.find((x) => x.id === rowId);
          const sh = row?.shelves.find((x) => x.id === shelfId);
          if (sh) sh.deletedAt = Date.now();
        });
        setConfirm(null);
      },
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost">
            ← {t.back}
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-ink">{storage.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <RolePill role={role} owner={isOwner(storage, currentUser.id)} />
              {isReadOnly(role) && (
                <span className="text-xs text-ink-muted">{t.youAreReadonly}</span>
              )}
            </div>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsEdit((p) => !p)}
            className={isEdit ? "btn-primary" : "btn-secondary"}
          >
            {isEdit ? t.done : "✎ " + t.edit}
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="📋"
          text={
            canEdit
              ? "No rows yet — click Add Row below."
              : "This storage has no rows yet."
          }
        />
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <div
              key={row.id}
              onClick={() => canEdit && setSelectedRowId(row.id)}
              className={`card cursor-pointer p-5 transition-all ${
                selectedRowId === row.id
                  ? "ring-2 ring-beex-500"
                  : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-bold uppercase tracking-wider text-ink">
                  {t.row} {row.letter}
                </div>
                <div className="text-xs text-ink-dim">
                  {row.shelves.length}{" "}
                  {row.shelves.length === 1 ? "drawer" : "drawers"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {row.shelves.map((shelf) => (
                  <div key={shelf.id} className="relative">
                    {isEdit && canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeShelf(row.id, shelf.id, shelf.coord);
                        }}
                        className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow"
                      >
                        ×
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        tapShelf(row.id, shelf);
                      }}
                      className={`flex h-24 w-full flex-col items-center justify-center rounded-xl p-2 text-xs font-semibold transition-all ${
                        shelf.isOpen
                          ? "bg-gradient-to-br from-beex-500 to-beex-400 text-beex-ink shadow-md"
                          : "surface-alt-bg text-ink hover:opacity-80"
                      } ${!canEdit ? "cursor-default" : ""}`}
                    >
                      <span className="text-[10px] uppercase opacity-70">
                        {shelf.coord}
                      </span>
                      <span className="my-1 text-lg font-extrabold">
                        {shelf.quantity}
                      </span>
                      <span className="line-clamp-1 text-[10px] opacity-80">
                        {shelf.label || t.empty}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {canEdit && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={isEdit ? removeRow : addRow}
            className={
              isEdit
                ? "rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 px-5 py-3 font-semibold text-white shadow"
                : "btn-primary"
            }
          >
            {isEdit ? "✕ " + t.removeSelected : "+ " + t.addRow}
          </button>
          {!isEdit && (
            <button
              onClick={addShelf}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-3 font-semibold text-white shadow"
            >
              ⊞ {t.addDrawer}
            </button>
          )}
        </div>
      )}

      <Modal
        open={qtyModal}
        onClose={() => setQtyModal(false)}
        title={t.editDrawer}
      >
        <input
          className="input-base mb-4"
          value={tempLabel}
          onChange={(e) => setTempLabel(e.target.value)}
          placeholder={t.itemName}
        />
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() =>
              setTempQty((p) => String(Math.max(0, (parseInt(p, 10) || 0) - 1)))
            }
            className="h-12 w-12 rounded-xl text-2xl font-bold hover:opacity-80 surface-alt-bg"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            className="input-base flex-1 text-center text-2xl font-bold"
            value={tempQty}
            onChange={(e) => setTempQty(e.target.value.replace(/\D/g, ""))}
          />
          <button
            onClick={() =>
              setTempQty((p) => String((parseInt(p, 10) || 0) + 1))
            }
            className="h-12 w-12 rounded-xl text-2xl font-bold hover:opacity-80 surface-alt-bg"
          >
            +
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setQtyModal(false)} className="btn-secondary flex-1">
            {t.cancel}
          </button>
          <button onClick={saveShelf} className="btn-primary flex-1">
            {t.save}
          </button>
        </div>
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.title}>
        <p className="mb-5 text-sm text-ink-muted">{confirm?.msg}</p>
        <div className="flex gap-2">
          <button onClick={() => setConfirm(null)} className="btn-secondary flex-1">
            {t.cancel}
          </button>
          <button
            onClick={confirm?.onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600"
          >
            {t.delete}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Explore tab ──────────────────────────────────────────────────────────── */
function ExploreTab() {
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const [q, setQ] = useState("");
  const [showToast, toastEl] = useToast();

  const publicStorages = useMemo(
    () => state.storages.filter((s) => s.isPublic),
    [state.storages]
  );
  const results = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return publicStorages;
    return publicStorages.filter(
      (s) =>
        s.name.toLowerCase().includes(qq) ||
        s.handle?.toLowerCase().includes(qq) ||
        s.id.toLowerCase().includes(qq)
    );
  }, [publicStorages, q]);

  const requestJoin = (storage) => {
    if (storage.members?.[currentUser.id]) return;
    if (storage.joinRequests?.some((r) => r.userId === currentUser.id)) return;
    dispatch((s) => {
      const tgt = s.storages.find((x) => x.id === storage.id);
      if (tgt) {
        tgt.joinRequests = tgt.joinRequests || [];
        tgt.joinRequests.push({
          userId: currentUser.id,
          requestedAt: Date.now(),
        });
      }
    });
    showToast(t.requestSent);
  };

  return (
    <div className="animate-fade-in">
      {toastEl}
      <PageHeader title={t.explore} subtitle={t.publicStorages} />

      <div className="mb-6 flex items-center gap-3 rounded-2xl p-3 shadow-sm card">
        <span className="pl-2 text-lg text-ink-dim">⌕</span>
        <input
          className="flex-1 bg-transparent text-sm outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.searchPlaceholder}
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="px-2 text-ink-dim hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <EmptyState icon={q ? "🔍" : "🌐"} text={q ? t.noResults : t.exploreHint} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((s) => {
            const isMember = !!s.members?.[currentUser.id];
            const isPending = s.joinRequests?.some(
              (r) => r.userId === currentUser.id
            );
            const memberCount = Object.keys(s.members || {}).length;
            return (
              <div key={s.id} className="card flex items-center gap-3 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-beex-500 to-beex-400 text-lg font-bold text-beex-ink">
                  {s.name[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold text-ink">{s.name}</div>
                  <div className="truncate text-xs text-ink-muted">
                    {s.handle} · {memberCount} {t.members} ·{" "}
                    {visibleRows(s.rows).length} {t.row.toLowerCase()}s
                  </div>
                </div>
                <button
                  disabled={isMember || isPending}
                  onClick={() => requestJoin(s)}
                  className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                    isMember
                      ? "badge-emerald"
                      : isPending
                      ? "badge-amber"
                      : "bg-beex-500 text-ink hover:bg-beex-400"
                  }`}
                >
                  {isMember ? t.alreadyMember : isPending ? t.pending : t.join}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Orders tab ───────────────────────────────────────────────────────────── */
function OrdersTab() {
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const [showToast, toastEl] = useToast();
  const [whModal, setWhModal] = useState(null);
  const [whChoice, setWhChoice] = useState("");

  const myStorages = state.storages.filter((s) => s.members?.[currentUser.id]);
  const [scopeId, setScopeId] = useState(myStorages[0]?.id || null);
  const scope = scopeId ? state.storages.find((s) => s.id === scopeId) : null;
  const myRole = scope ? getRole(scope, currentUser.id) : null;

  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  const orders = useMemo(
    () =>
      state.orders
        .filter((o) => o.storageId === scopeId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.orders, scopeId]
  );

  const create = () => {
    if (!name.trim() || !qty.trim() || !scope) return;
    dispatch((s) => {
      const id = newId("order", s);
      const startStatus =
        myRole === "Student" ? STATUS.PENDING_TEACHER : STATUS.PENDING_HOD;
      s.orders.unshift({
        id,
        storageId: scope.id,
        item: name.trim(),
        quantity: qty,
        status: startStatus,
        requesterId: currentUser.id,
        requesterUsername: currentUser.username,
        warehouseId: null,
        createdAt: Date.now(),
        history: [{ status: startStatus, by: currentUser.id, at: Date.now() }],
      });
    });
    setName("");
    setQty("");
    showToast(t.orderSent);
  };

  const approve = (order) => {
    if (myRole === "Teacher" && !order.warehouseId) {
      setWhModal({ orderId: order.id });
      setWhChoice(scope?.warehouses?.[0]?.id || "");
      return;
    }
    finishApprove(order, order.warehouseId);
  };

  const finishApprove = (order, whId) => {
    dispatch((s) => {
      const o = s.orders.find((x) => x.id === order.id);
      if (!o) return;
      const next = nextStatusAfterApproval(myRole);
      if (!next) return;
      o.status = next;
      if (whId) o.warehouseId = whId;
      o.history.push({ status: next, by: currentUser.id, at: Date.now() });
    });
    showToast(t.orderSent);
  };

  const reject = (order) => {
    dispatch((s) => {
      const o = s.orders.find((x) => x.id === order.id);
      if (!o) return;
      o.status = STATUS.REJECTED;
      o.history.push({
        status: STATUS.REJECTED,
        by: currentUser.id,
        at: Date.now(),
      });
    });
    showToast("Rejected");
  };

  const confirmWh = () => {
    if (!whChoice) return;
    const order = state.orders.find((o) => o.id === whModal.orderId);
    if (!order) return;
    finishApprove(order, whChoice);
    showToast(t.warehouseSelectedToast);
    setWhModal(null);
    setWhChoice("");
  };

  if (!scope) {
    return (
      <div className="animate-fade-in">
        <PageHeader title={t.orders} />
        <EmptyState icon="📋" text={t.inventoryEmpty} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {toastEl}
      <PageHeader
        title={t.orders}
        subtitle={`${t.forStorage} ${scope.name}`}
        action={
          myStorages.length > 1 ? (
            <select
              value={scopeId || ""}
              onChange={(e) => setScopeId(e.target.value)}
              className="input-base max-w-xs"
            >
              {myStorages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : null
        }
      />

      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-beex-500/15 to-beex-400/15 p-4 ring-1 ring-beex-500/20">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-sm surface-bg">
          👤
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {t.role}
          </div>
          <div className="text-sm font-bold text-ink">{myRole}</div>
        </div>
      </div>

      {(myRole === "Student" || myRole === "Teacher") && (
        <div className="card mb-6 p-5">
          <div className="mb-3 text-sm font-extrabold text-ink">
            {t.createOrder}
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_140px_auto]">
            <input
              className="input-base"
              placeholder={t.productName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="input-base"
              placeholder={t.quantity}
              type="number"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
            <button onClick={create} className="btn-primary">
              {t.sendRequest}
            </button>
          </div>
        </div>
      )}

      <div className="mb-3 text-xs font-extrabold uppercase tracking-widest text-ink-muted">
        {t.orderList}
      </div>
      {orders.length === 0 ? (
        <EmptyState text={t.noOrders} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {orders.map((o) => {
            const canAct = canActOnOrder(o, myRole);
            const requesterUser = state.users.find((u) => u.id === o.requesterId);
            const wh = scope.warehouses?.find((w) => w.id === o.warehouseId);
            return (
              <div key={o.id} className="card p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="font-bold text-ink">
                    📦 {o.item} ×{o.quantity}
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-xs text-ink-muted">
                  {t.requestedBy}:{" "}
                  {requesterUser?.handle || o.requesterUsername}
                </div>
                {wh && (
                  <div className="mt-1 text-xs font-semibold text-beex-600">
                    → {wh.name}
                  </div>
                )}
                {canAct && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => reject(o)}
                      className="flex-1 rounded-xl alert-error py-2 text-sm font-semibold hover:opacity-80"
                    >
                      {t.reject}
                    </button>
                    <button
                      onClick={() => approve(o)}
                      className="btn-primary flex-1 py-2 text-sm"
                    >
                      {myRole === "Warehouse" ? t.deliverProduct : t.approve}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={!!whModal}
        onClose={() => setWhModal(null)}
        title={t.selectWarehouse}
      >
        {scope.warehouses?.length ? (
          <select
            className="input-base mb-4"
            value={whChoice}
            onChange={(e) => setWhChoice(e.target.value)}
          >
            <option value="">{t.chooseWarehouse}</option>
            {scope.warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="mb-4 rounded-lg alert-info p-3 text-sm">
            {t.noWarehouses}
          </div>
        )}
        <div className="flex gap-2">
          <button onClick={() => setWhModal(null)} className="btn-secondary flex-1">
            {t.cancel}
          </button>
          <button
            disabled={!whChoice}
            onClick={confirmWh}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {t.save}
          </button>
        </div>
      </Modal>
    </div>
  );
}

/* ─── Settings tab ─────────────────────────────────────────────────────────── */
function SettingsTab({ darkMode, setDarkMode, lang, setLang, onLogout }) {
  const { t } = useLang();
  const { currentUser } = useApp();
  const [notifs, setNotifs] = useState(true);
  const [pubProfile, setPubProfile] = useState(true);
  const [view, setView] = useState("main"); // main | hier | profile | pw
  const [showToast, toastEl] = useToast();

  if (view === "hier") return <HierarchyView onBack={() => setView("main")} />;
  if (view === "profile") return <EditProfileView onBack={() => setView("main")} />;
  if (view === "pw") return <ChangePasswordView onBack={() => setView("main")} />;

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-ink-muted">
        {title}
      </h3>
      <div className="grid gap-2 md:grid-cols-2">{children}</div>
    </div>
  );

  const Row = ({ icon, label, type, value, onClick, danger }) => (
    <div
      onClick={type === "switch" ? undefined : onClick}
      className={`card flex items-center gap-3 p-4 ${
        type === "switch" ? "cursor-default" : "cursor-pointer"
      } ${danger ? "ring-rose-300 dark:ring-rose-700" : ""}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
          danger ? "badge-rose" : "bg-beex-50"
        }`}
      >
        {icon}
      </div>
      <div className={`flex-1 text-sm font-semibold ${danger ? "alert-error-text" : "text-ink"}`}>
        {label}
      </div>
      {type === "switch" ? (
        <Switch checked={!!value} onChange={onClick} />
      ) : (
        <span className="text-ink-dim">›</span>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in">
      {toastEl}
      <PageHeader title={t.settings} />

      <div className="card mb-6 flex items-center gap-4 p-5">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-beex-500 to-beex-400 text-2xl font-extrabold text-beex-ink shadow-md">
          {currentUser.username[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-extrabold text-ink">
            {currentUser.username}
          </div>
          <div className="truncate text-sm text-ink-muted">{currentUser.handle}</div>
          <div className="truncate text-xs text-ink-dim">{currentUser.email}</div>
        </div>
        <button onClick={() => setView("profile")} className="btn-secondary px-4 py-2 text-sm">
          {t.editProfile}
        </button>
      </div>

      <Section title={t.organization}>
        <Row icon="👥" label={t.teamHierarchy} onClick={() => setView("hier")} />
      </Section>

      <Section title={t.preferences}>
        <Row
          icon="🔔"
          label={t.pushNotifications}
          type="switch"
          value={notifs}
          onClick={() => setNotifs((p) => !p)}
        />
        <Row
          icon="👁"
          label={t.publicProfile}
          type="switch"
          value={pubProfile}
          onClick={() => setPubProfile((p) => !p)}
        />
        <Row
          icon="🌙"
          label={t.darkMode}
          type="switch"
          value={darkMode}
          onClick={() => setDarkMode((p) => !p)}
        />
        <Row
          icon="🌐"
          label={`${t.language}: ${lang === "en" ? "English" : "Shqip"}`}
          onClick={() => setLang((l) => (l === "en" ? "sq" : "en"))}
        />
      </Section>

      <Section title={t.accountSecurity}>
        <Row icon="🔑" label={t.changePassword} onClick={() => setView("pw")} />
        <Row
          icon="🛡"
          label={t.privacyPolicy}
          onClick={() => showToast("Privacy policy lives at beex.io/privacy.")}
        />
      </Section>

      <Section title="">
        <Row icon="🚪" label={t.logout} danger onClick={onLogout} />
      </Section>

      <p className="mt-4 text-center text-xs text-ink-dim">{t.version}</p>
    </div>
  );
}

/* ─── Hierarchy (admin) ────────────────────────────────────────────────────── */
function HierarchyView({ onBack }) {
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const myStorages = state.storages.filter((s) => isAdmin(s, currentUser.id));
  const [scopeId, setScopeId] = useState(myStorages[0]?.id || null);
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState(null);
  const [showToast, toastEl] = useToast();
  const scope = scopeId ? state.storages.find((s) => s.id === scopeId) : null;

  const memberRows = useMemo(() => {
    if (!scope) return [];
    const q = search.trim().toLowerCase();
    return Object.entries(scope.members || {})
      .map(([userId, m]) => {
        const u = state.users.find((x) => x.id === userId);
        return {
          userId,
          user: u,
          role: m.role,
          isAdmin: !!m.isAdmin,
          isOwner: scope.ownerId === userId,
        };
      })
      .filter(
        (r) =>
          !q ||
          r.user?.username.toLowerCase().includes(q) ||
          r.user?.handle?.toLowerCase().includes(q)
      );
  }, [scope, state.users, search]);

  const setRole = (userId, role) => {
    dispatch((s) => {
      const tgt = s.storages.find((x) => x.id === scopeId);
      if (tgt?.members?.[userId]) tgt.members[userId].role = role;
    });
    setRoleModal(null);
  };

  const toggleAdmin = (userId, isOwnerRow) => {
    if (isOwnerRow) {
      showToast(t.ownerLockMsg);
      return;
    }
    dispatch((s) => {
      const tgt = s.storages.find((x) => x.id === scopeId);
      if (tgt?.members?.[userId])
        tgt.members[userId].isAdmin = !tgt.members[userId].isAdmin;
    });
  };

  if (!scope) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title={t.manageUsers}
          action={
            <button onClick={onBack} className="btn-ghost">
              ← {t.back}
            </button>
          }
        />
        <EmptyState text="You are not an Admin in any storage yet." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {toastEl}
      <PageHeader
        title={t.manageUsers}
        subtitle={t.assignRoles}
        action={
          <button onClick={onBack} className="btn-ghost">
            ← {t.back}
          </button>
        }
      />

      {myStorages.length > 1 && (
        <select
          value={scopeId}
          onChange={(e) => setScopeId(e.target.value)}
          className="input-base mb-4 max-w-xs"
        >
          {myStorages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      <div className="mb-6 flex items-center gap-3 rounded-2xl p-3 shadow-sm card">
        <span className="pl-2 text-lg text-ink-dim">⌕</span>
        <input
          className="flex-1 bg-transparent text-sm outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
        />
      </div>

      {memberRows.length === 0 ? (
        <EmptyState text={t.noResults} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {memberRows.map((r) => (
            <div key={r.userId} className="card flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-beex-500 to-beex-400 text-lg font-bold text-beex-ink">
                {r.user?.username[0].toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 truncate font-bold text-ink">
                  {r.user?.username || r.userId}
                  {r.isOwner && <span title={t.ownerLockMsg}>🔒</span>}
                </div>
                <div className="text-xs text-ink-muted">
                  {r.role} {r.isAdmin && "· Admin"}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-semibold text-ink-muted">{t.adminToggle}</span>
                  <Switch
                    checked={r.isAdmin}
                    disabled={r.isOwner}
                    onChange={() => toggleAdmin(r.userId, r.isOwner)}
                  />
                </div>
                <button
                  disabled={r.isOwner}
                  onClick={() => setRoleModal({ userId: r.userId, role: r.role })}
                  className="rounded-lg surface-alt-bg px-3 py-1 text-xs font-semibold text-ink hover:opacity-80 disabled:opacity-50"
                >
                  {t.changeRole}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!roleModal}
        onClose={() => setRoleModal(null)}
        title={t.selectRole}
      >
        <div className="grid gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(roleModal.userId, r)}
              className={`rounded-xl px-4 py-3 text-left font-semibold transition-colors ${
                roleModal?.role === r
                  ? "bg-beex-500 text-ink"
                  : "surface-alt-bg text-ink hover:opacity-80"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <button
          onClick={() => setRoleModal(null)}
          className="btn-secondary mt-4 w-full"
        >
          {t.cancel}
        </button>
      </Modal>
    </div>
  );
}

/* ─── Profile editor ───────────────────────────────────────────────────────── */
function EditProfileView({ onBack }) {
  const { t } = useLang();
  const { state, dispatch, currentUser, setCurrentUser } = useApp();
  const [f, setF] = useState({
    username: currentUser.username,
    handle: currentUser.handle,
    email: currentUser.email,
  });
  const [err, setErr] = useState("");
  const [showToast, toastEl] = useToast();

  const save = () => {
    setErr("");
    if (!f.username.trim() || !f.handle.trim() || !f.email.trim())
      return setErr(t.fieldRequired);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr(t.invalidEmail);
    if (
      state.users.some(
        (u) =>
          u.id !== currentUser.id &&
          u.username.toLowerCase() === f.username.trim().toLowerCase()
      )
    )
      return setErr(t.usernameTaken);
    const ch = f.handle.startsWith("@") ? f.handle : `@${f.handle}`;
    if (
      state.users.some(
        (u) => u.id !== currentUser.id && u.handle.toLowerCase() === ch.toLowerCase()
      )
    )
      return setErr(t.handleTaken);
    dispatch((s) => {
      const u = s.users.find((x) => x.id === currentUser.id);
      if (u) {
        u.username = f.username.trim();
        u.handle = ch;
        u.email = f.email.trim();
      }
    });
    setCurrentUser({
      ...currentUser,
      username: f.username.trim(),
      handle: ch,
      email: f.email.trim(),
    });
    showToast(t.profileUpdated);
    setTimeout(onBack, 700);
  };

  return (
    <div className="animate-fade-in max-w-xl">
      {toastEl}
      <PageHeader
        title={t.editProfileTitle}
        action={
          <button onClick={onBack} className="btn-ghost">
            ← {t.back}
          </button>
        }
      />
      <div className="card p-6">
        {err && (
          <div className="mb-3 rounded-lg alert-error px-3 py-2 text-sm font-semibold">
            {err}
          </div>
        )}
        <input
          className="input-base mb-3"
          placeholder={t.username}
          value={f.username}
          onChange={(e) => setF({ ...f, username: e.target.value })}
        />
        <input
          className="input-base mb-3"
          placeholder={t.handle}
          value={f.handle}
          onChange={(e) => setF({ ...f, handle: e.target.value })}
        />
        <input
          className="input-base mb-4"
          placeholder={t.email}
          type="email"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
        />
        <button onClick={save} className="btn-primary w-full">
          {t.saveChanges}
        </button>
      </div>
    </div>
  );
}

function ChangePasswordView({ onBack }) {
  const { t } = useLang();
  const { dispatch, currentUser } = useApp();
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");
  const [showToast, toastEl] = useToast();

  const save = () => {
    setErr("");
    if (!f.current || !f.next || !f.confirm) return setErr(t.fieldRequired);
    if (f.next !== f.confirm) return setErr(t.passwordMismatch);
    if (currentUser.password && f.current !== currentUser.password)
      return setErr(t.wrongCurrentPassword);
    dispatch((s) => {
      const u = s.users.find((x) => x.id === currentUser.id);
      if (u) u.password = f.next;
    });
    showToast(t.passwordChanged);
    setTimeout(onBack, 700);
  };

  return (
    <div className="animate-fade-in max-w-xl">
      {toastEl}
      <PageHeader
        title={t.changePassword}
        action={
          <button onClick={onBack} className="btn-ghost">
            ← {t.back}
          </button>
        }
      />
      <div className="card p-6">
        {err && (
          <div className="mb-3 rounded-lg alert-error px-3 py-2 text-sm font-semibold">
            {err}
          </div>
        )}
        <input
          type="password"
          className="input-base mb-3"
          placeholder={t.currentPassword}
          value={f.current}
          onChange={(e) => setF({ ...f, current: e.target.value })}
        />
        <input
          type="password"
          className="input-base mb-3"
          placeholder={t.newPassword}
          value={f.next}
          onChange={(e) => setF({ ...f, next: e.target.value })}
        />
        <input
          type="password"
          className="input-base mb-4"
          placeholder={t.confirmNewPassword}
          value={f.confirm}
          onChange={(e) => setF({ ...f, confirm: e.target.value })}
        />
        <button onClick={save} className="btn-primary w-full">
          {t.saveChanges}
        </button>
      </div>
    </div>
  );
}

/* ─── Layout helpers ───────────────────────────────────────────────────────── */
function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-ink lg:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center" style={{ borderColor: "var(--c-border)", background: "var(--c-surface-alt)" }}>
      {icon && <div className="mb-3 text-5xl opacity-60">{icon}</div>}
      <p className="text-sm text-ink-muted">{text}</p>
    </div>
  );
}

/* ─── Main shell ───────────────────────────────────────────────────────────── */
export default function BeexStorageWebsite() {
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState("landing"); // landing | login | signup | main
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);
  useEffect(() => {
    document.documentElement.dataset.dark = dark ? "true" : "false";
  }, [dark]);

  const t = T[lang];
  const dispatch = useCallback((mutator) => {
    setState((prev) => {
      const draft = JSON.parse(JSON.stringify(prev));
      mutator(draft);
      return draft;
    });
  }, []);

  const login = (u) => {
    setCurrentUser(u);
    setScreen("main");
  };
  const logout = () => {
    setCurrentUser(null);
    setScreen("landing");
    setTab(0);
  };

  const tabs = [
    { id: 0, label: t.inventory, icon: "🗂", node: <InventoryTab /> },
    { id: 1, label: t.explore, icon: "🔍", node: <ExploreTab /> },
    { id: 2, label: t.orders, icon: "📦", node: <OrdersTab /> },
    {
      id: 3,
      label: t.settings,
      icon: "⚙",
      node: (
        <SettingsTab
          darkMode={dark}
          setDarkMode={setDark}
          lang={lang}
          setLang={setLang}
          onLogout={logout}
        />
      ),
    },
  ];

  return (
    <LangContext.Provider value={{ t, lang, setLang }}>
      <AppContext.Provider value={{ state, dispatch, currentUser, setCurrentUser }}>
        {screen === "landing" && (
          <LandingScreen
            onLogin={() => setScreen("login")}
            onSignup={() => setScreen("signup")}
          />
        )}
        {screen === "login" && (
          <LoginScreen
            onLogin={login}
            onGoSignup={() => setScreen("signup")}
            onBack={() => setScreen("landing")}
          />
        )}
        {screen === "signup" && (
          <SignupScreen
            onGoLogin={() => setScreen("login")}
            onBack={() => setScreen("landing")}
          />
        )}
        {screen === "main" && currentUser && (
          <div className="flex min-h-screen" style={{ background: "var(--c-bg)" }}>
            {/* Sidebar — desktop ≥ lg */}
            <aside className="hidden w-72 shrink-0 flex-col p-4 lg:flex" style={{ background: "var(--c-surface)", borderRight: "1px solid var(--c-border)" }}>
              <div className="mb-6 flex items-center gap-3 px-2 py-2">
                <img src={logo} alt="" className="h-10 w-10 rounded-xl" />
                <div className="min-w-0">
                  <div className="truncate font-extrabold text-ink dark:text-white">
                    {t.appName}
                  </div>
                  <div className="truncate text-xs text-ink-muted">{t.tagline}</div>
                </div>
              </div>
              <nav className="flex-1 space-y-1">
                {tabs.map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTab(tb.id)}
                    className={`sidebar-item w-full text-left ${
                      tab === tb.id ? "sidebar-item-active" : ""
                    }`}
                  >
                    <span className="text-lg">{tb.icon}</span>
                    <span>{tb.label}</span>
                  </button>
                ))}
              </nav>
              <div className="mt-4 flex items-center gap-3 rounded-2xl p-3" style={{ background: "var(--c-surface-alt)" }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-beex-500 to-beex-400 font-extrabold text-beex-ink">
                  {currentUser.username[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-ink dark:text-white">
                    {currentUser.username}
                  </div>
                  <div className="truncate text-xs text-ink-muted">
                    {currentUser.handle}
                  </div>
                </div>
              </div>
            </aside>

            {/* Mobile drawer */}
            {drawerOpen && (
              <div
                className="fixed inset-0 z-40 lg:hidden"
                onClick={() => setDrawerOpen(false)}
              >
                <div className="absolute inset-0 bg-black/50" />
                <aside
                  className="absolute left-0 top-0 flex h-full w-72 flex-col p-4 shadow-2xl animate-slide-up"
                  style={{ background: "var(--c-surface)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-6 flex items-center gap-3 px-2 py-2">
                    <img src={logo} alt="" className="h-10 w-10 rounded-xl" />
                    <div>
                      <div className="font-extrabold text-ink dark:text-white">
                        {t.appName}
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 space-y-1">
                    {tabs.map((tb) => (
                      <button
                        key={tb.id}
                        onClick={() => {
                          setTab(tb.id);
                          setDrawerOpen(false);
                        }}
                        className={`sidebar-item w-full text-left ${
                          tab === tb.id ? "sidebar-item-active" : ""
                        }`}
                      >
                        <span className="text-lg">{tb.icon}</span>
                        <span>{tb.label}</span>
                      </button>
                    ))}
                  </nav>
                </aside>
              </div>
            )}

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Top bar (mobile shows hamburger; desktop shows breadcrumb) */}
              <header className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8" style={{ background: "var(--c-surface)", borderBottom: "1px solid var(--c-border)" }}>
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="btn-ghost lg:hidden"
                  aria-label="Menu"
                >
                  ☰
                </button>
                <div className="flex items-center gap-2 lg:hidden">
                  <img src={logo} alt="" className="h-8 w-8 rounded-lg" />
                  <span className="font-extrabold text-ink dark:text-white">
                    {t.appName}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <span className="text-sm font-semibold text-ink-muted">
                    {tabs.find((x) => x.id === tab)?.label}
                  </span>
                </div>
                <button
                  onClick={() => setTab(3)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-beex-500 to-beex-400 text-sm font-extrabold text-beex-ink"
                >
                  {currentUser.username[0].toUpperCase()}
                </button>
              </header>

              <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                <div className="mx-auto max-w-7xl">{tabs.find((x) => x.id === tab)?.node}</div>
              </main>
            </div>
          </div>
        )}
      </AppContext.Provider>
    </LangContext.Provider>
  );
}
