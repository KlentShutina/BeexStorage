import { useState, useEffect, useMemo, useCallback, createContext, useContext } from "react";
import logo from "./assets/logo.png";
import { appCss } from "./styles";
import { T } from "./i18n";
import {
  loadState, saveState, newId, parseScanned, visibleRows,
  getRole, getMembership, isAdmin, isOwner, isReadOnly, canEditInventory,
  canActOnOrder, nextStatusAfterApproval, statusForRole,
  ROLES, STATUS, DEV_BYPASS,
} from "./data";

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
const LangContext = createContext(null);
const useLang = () => useContext(LangContext);

// AppContext exposes db state + helpers to every component without prop-drilling.
const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ─── UTIL: TOAST ─────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{msg}</div>;
}
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg) => setToast(msg), []);
  const el = toast ? <Toast msg={toast} onDone={() => setToast(null)} /> : null;
  return [show, el];
}

// ─── AUTH SCREENS ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin, onGoSignup }) {
  const { t } = useLang();
  const { state } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = () => {
    if (!username.trim() || !password.trim()) { setError(t.fieldRequired); return; }
    setLoading(true); setError("");
    // Dev bypass per MVP §1
    setTimeout(() => {
      if (username.trim() === DEV_BYPASS.username && password === DEV_BYPASS.password) {
        onLogin(state.users.find(u => u.username === DEV_BYPASS.username) || { id: "u_admin", username: "adminx", handle: "@adminx", email: "admin@beex.io" });
        return;
      }
      const user = state.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      if (!user || user.password !== password) {
        setError(t.loginError); setLoading(false); return;
      }
      onLogin(user);
    }, 400);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo-row">
          <img src={logo} alt="BeexStorage" className="auth-logo-img" />
          <div className="auth-title">{t.appName}</div>
        </div>
        <div className="auth-sub">{t.tagline}</div>
        <div className="auth-info">{t.welcomeBack} 👋 — Demo: <b>adminx</b> / <b>12345</b></div>
        {error && <div className="auth-error">{error}</div>}
        <input className="auth-input" placeholder={t.username} value={username}
          onChange={e => setUsername(e.target.value)} autoCapitalize="none" autoComplete="username" />
        <input className="auth-input" placeholder={t.password} type="password" value={password}
          onChange={e => setPassword(e.target.value)} autoComplete="current-password"
          onKeyDown={e => e.key === "Enter" && !loading && handle()} />
        <button className="auth-btn" onClick={handle} disabled={loading}>
          {loading ? "…" : t.login}
        </button>
        <div className="auth-link" onClick={onGoSignup}>{t.noAccount}</div>
      </div>
    </div>
  );
}

function SignupScreen({ onGoLogin }) {
  // Per MVP §1: 5 fields — Username, Handle, Email, Password, Confirm Password.
  // Dev bypass (adminx/12345) skips all validation per MVP §1.
  const { t } = useLang();
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({ username: "", handle: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, toastEl] = useToast();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handle = () => {
    setError("");
    const isBypass = form.username.trim() === DEV_BYPASS.username && form.password === DEV_BYPASS.password;
    if (!isBypass) {
      if (!form.username.trim() || !form.handle.trim() || !form.email.trim() || !form.password || !form.confirm) {
        setError(t.fieldRequired); return;
      }
      if (form.password !== form.confirm) { setError(t.passwordMismatch); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(t.invalidEmail); return; }
      if (state.users.some(u => u.username.toLowerCase() === form.username.trim().toLowerCase())) { setError(t.usernameTaken); return; }
      const cleanHandle = form.handle.startsWith("@") ? form.handle : `@${form.handle}`;
      if (state.users.some(u => u.handle.toLowerCase() === cleanHandle.toLowerCase())) { setError(t.handleTaken); return; }
    }
    setLoading(true);
    setTimeout(() => {
      dispatch((s) => {
        const id = newId("user", s);
        const cleanHandle = form.handle.startsWith("@") ? form.handle : `@${form.handle || form.username}`;
        s.users.push({ id, username: form.username.trim(), handle: cleanHandle, email: form.email.trim(), password: form.password });
      });
      showToast(t.accountCreated);
      setLoading(false);
      setTimeout(onGoLogin, 1100);
    }, 500);
  };

  return (
    <div className="auth-wrap">
      {toastEl}
      <div className="auth-card">
        <div className="auth-logo-row">
          <img src={logo} alt="BeexStorage" className="auth-logo-img" />
          <div className="auth-title">{t.signup}</div>
        </div>
        <div className="auth-sub">{t.tagline}</div>
        {error && <div className="auth-error">{error}</div>}
        <input className="auth-input" placeholder={t.username} value={form.username}
          onChange={e => set("username", e.target.value)} autoCapitalize="none" />
        <input className="auth-input" placeholder={t.handle} value={form.handle}
          onChange={e => set("handle", e.target.value)} autoCapitalize="none" />
        <input className="auth-input" placeholder={t.email} type="email" value={form.email}
          onChange={e => set("email", e.target.value)} autoCapitalize="none" />
        <input className="auth-input" placeholder={t.password} type="password" value={form.password}
          onChange={e => set("password", e.target.value)} />
        <input className="auth-input" placeholder={t.confirmPassword} type="password" value={form.confirm}
          onChange={e => set("confirm", e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loading && handle()} />
        <button className="auth-btn" onClick={handle} disabled={loading}>
          {loading ? "…" : t.register}
        </button>
        <div className="auth-link" onClick={onGoLogin}>{t.hasAccount}</div>
      </div>
    </div>
  );
}

// ─── INVENTORY TAB ────────────────────────────────────────────────────────────

function InventoryTab() {
  // Shows a list of storages the current user belongs to. Tapping a storage
  // navigates into its rows/drawers. The role-pill is computed per-storage,
  // because MVP §2 mandates roles are scoped to each StorageID.
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const [activeId, setActiveId] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [scanError, setScanError] = useState("");
  const [showToast, toastEl] = useToast();

  // Storages this user is a member of
  const myStorages = useMemo(
    () => state.storages.filter(s => s.members?.[currentUser.id]),
    [state.storages, currentUser.id]
  );

  const cur = state.storages.find(s => s.id === activeId);

  // ─── SCANNING (Universal Scanner — MVP §2) ─────────────────────────────────
  const performScan = (rawInput) => {
    setScanError("");
    const id = parseScanned(rawInput);
    if (!id) { setScanError(t.scannedNotFound); return; }
    setScanning(true);
    setTimeout(() => {
      // Try to find a matching storage by id, handle, or device id
      const found = state.storages.find(s =>
        s.id === id || s.handle?.replace("@", "") === id.replace("@", "") || s.deviceId === id
      );
      if (!found) {
        // Per MVP §4: first scanner becomes owner. Create a new storage.
        dispatch((s) => {
          const sid = newId("storage", s);
          s.storages.push({
            id: sid, name: `Storage ${id}`, handle: `@${id.toLowerCase()}`,
            ownerId: currentUser.id, isPublic: false, deviceId: id, paired: true,
            createdAt: Date.now(),
            members: { [currentUser.id]: { role: "Teacher", isAdmin: true, joinedAt: Date.now() } },
            joinRequests: [], rows: [], warehouses: [],
          });
        });
        showToast(t.scannedSuccess);
      } else if (found.members?.[currentUser.id]) {
        // Already member — just open it
        setActiveId(found.id);
        showToast(t.scannedSuccess);
      } else {
        // Add as Student by default
        dispatch((s) => {
          const target = s.storages.find(st => st.id === found.id);
          if (target) {
            target.members[currentUser.id] = { role: "Student", isAdmin: false, joinedAt: Date.now() };
            target.paired = true;
            if (!target.deviceId) target.deviceId = id;
          }
        });
        showToast(t.scannedSuccess);
      }
      setScanning(false); setScanOpen(false); setScanInput("");
    }, 1200);
  };

  if (cur) return <StorageDetail storage={cur} onBack={() => setActiveId(null)} />;

  return (
    <div>
      {toastEl}
      <div className="page-header">
        <div className="page-title">{t.systems}</div>
        <div className="page-sub">{currentUser.handle} · {myStorages.length} {t.storages}</div>
      </div>

      {myStorages.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <div className="text">{t.inventoryEmpty}</div>
        </div>
      ) : myStorages.map(inv => {
        const m = getMembership(inv, currentUser.id);
        const owner = isOwner(inv, currentUser.id);
        return (
          <div key={inv.id} className="card sys-card" onClick={() => setActiveId(inv.id)}>
            <div className="sys-icon">📦</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sys-name">{inv.name}</div>
              <div className="sys-handle">{inv.handle}</div>
              <div className="sys-status">{inv.paired ? `✓ ${t.connected}: ${inv.deviceId}` : t.disconnected}</div>
            </div>
            <span className={`role-pill${owner ? " owner" : ""}`}>{owner ? t.youAreOwner : m?.role}</span>
          </div>
        );
      })}

      <button className="scan-fab" onClick={() => setScanOpen(true)} aria-label={t.scan}>⌗</button>

      {scanOpen && (
        <div className="modal-backdrop" onClick={() => !scanning && setScanOpen(false)}>
          <div className="scan-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t.scannerTitle}</div>
            <div className="scan-cam">
              <div className="icon">📷</div>
            </div>
            <div className="page-sub" style={{ marginBottom: 12, textAlign: "center", padding: "0 4px" }}>{t.scannerHint}</div>
            {scanError && <div className="auth-error">{scanError}</div>}
            <input className="modal-input" placeholder={t.manualIdPlaceholder}
              value={scanInput} onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && performScan(scanInput)} />
            <button className="modal-save" onClick={() => performScan(scanInput || "DEMO-NEW-ID")}>{t.confirmScan}</button>
            <button className="modal-cancel" onClick={() => setScanOpen(false)}>{t.cancel}</button>
          </div>
        </div>
      )}

      {scanning && (
        <div className="scanning-overlay">
          <div className="spinner" />
          <div className="scanning-text">{t.scanning}</div>
        </div>
      )}
    </div>
  );
}

function StorageDetail({ storage, onBack }) {
  // Inside a single storage. Shows rows + drawers. Edit privileges depend on
  // the user's per-storage role: only Teachers can mutate (MVP §3).
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

  const addRow = () => dispatch((s) => {
    const target = s.storages.find(x => x.id === storage.id);
    if (!target) return;
    const live = (target.rows || []).filter(r => !r.deletedAt);
    const letter = String.fromCharCode(65 + live.length);
    const id = newId("row", s);
    target.rows.push({ id, letter, shelves: [], deletedAt: null });
    setSelectedRowId(id);
  });

  const removeRow = () => {
    if (!selectedRowId) return;
    const r = rows.find(x => x.id === selectedRowId);
    if (!r) return;
    setConfirm({
      title: t.deleteRow,
      msg: t.deleteRowMsg.replace("{name}", r.letter),
      onConfirm: () => {
        dispatch((s) => {
          const target = s.storages.find(x => x.id === storage.id);
          if (!target) return;
          const row = target.rows.find(x => x.id === selectedRowId);
          if (row) row.deletedAt = Date.now(); // soft delete (MVP §5)
        });
        setSelectedRowId(null); setConfirm(null);
      },
    });
  };

  const addShelf = () => {
    if (!selectedRowId) return;
    dispatch((s) => {
      const target = s.storages.find(x => x.id === storage.id);
      if (!target) return;
      const row = target.rows.find(x => x.id === selectedRowId);
      if (!row) return;
      const liveShelves = (row.shelves || []).filter(sh => !sh.deletedAt);
      const nums = liveShelves.map(sh => parseInt(sh.coord.substring(1)) || 0);
      const next = nums.length ? Math.max(...nums) + 1 : 1;
      row.shelves.push({ id: newId("shelf", s), coord: `${row.letter}${next}`, label: "", quantity: 0, isOpen: false, deletedAt: null });
    });
  };

  const handleShelfTap = (rowId, shelf) => {
    if (isEdit && canEdit) {
      setActiveShelf({ rowId, shelfId: shelf.id });
      setTempLabel(shelf.label || "");
      setTempQty(String(shelf.quantity || 0));
      setQtyModal(true);
    } else if (canEdit) {
      // Toggle open/closed (Teacher quick-toggle)
      dispatch((s) => {
        const target = s.storages.find(x => x.id === storage.id);
        const row = target?.rows.find(x => x.id === rowId);
        const sh = row?.shelves.find(x => x.id === shelf.id);
        if (sh) sh.isOpen = !sh.isOpen;
      });
    }
    // Read-only roles see status only — no toggling.
  };

  const saveShelf = () => {
    if (!activeShelf) return;
    dispatch((s) => {
      const target = s.storages.find(x => x.id === storage.id);
      const row = target?.rows.find(x => x.id === activeShelf.rowId);
      const sh = row?.shelves.find(x => x.id === activeShelf.shelfId);
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
          const target = s.storages.find(x => x.id === storage.id);
          const row = target?.rows.find(x => x.id === rowId);
          const sh = row?.shelves.find(x => x.id === shelfId);
          if (sh) sh.deletedAt = Date.now();
        });
        setConfirm(null);
      },
    });
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      {qtyModal && (
        <div className="modal-backdrop" onClick={() => setQtyModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t.editDrawer}</div>
            <input className="modal-input" value={tempLabel}
              onChange={e => setTempLabel(e.target.value)} placeholder={t.itemName} />
            <div className="qty-row">
              <button className="qty-btn" onClick={() => setTempQty(p => String(Math.max(0, (parseInt(p, 10) || 0) - 1)))}>−</button>
              {/* Manual entry (MVP §5) — direct text input for bulk changes */}
              <input className="qty-val" type="number" inputMode="numeric"
                value={tempQty} onChange={e => setTempQty(e.target.value.replace(/\D/g, ""))} />
              <button className="qty-btn" onClick={() => setTempQty(p => String((parseInt(p, 10) || 0) + 1))}>+</button>
            </div>
            <button className="modal-save" onClick={saveShelf}>{t.save}</button>
            <button className="modal-cancel" onClick={() => setQtyModal(false)}>{t.cancel}</button>
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-backdrop" onClick={() => setConfirm(null)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">{confirm.title}</div>
            <div className="confirm-msg">{confirm.msg}</div>
            <div className="confirm-btns">
              <button className="confirm-btn confirm-cancel" onClick={() => setConfirm(null)}>{t.cancel}</button>
              <button className="confirm-btn confirm-delete" onClick={confirm.onConfirm}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}

      <div className="inv-topbar">
        <button className="page-back" onClick={onBack}>‹ {t.back}</button>
        <div className="inv-title-block">
          <div className="inv-title">{storage.name}</div>
          <div className="inv-meta">
            <span className={`role-pill${isOwner(storage, currentUser.id) ? " owner" : ""}`}>
              {isOwner(storage, currentUser.id) ? t.youAreOwner : (role || "—")}
            </span>
            {isReadOnly(role) && <span style={{ fontSize: 11, color: "var(--text-2)" }}>{t.youAreReadonly}</span>}
          </div>
        </div>
        {canEdit && (
          <button className={`edit-btn${isEdit ? " active" : ""}`} onClick={() => setIsEdit(p => !p)}>
            {isEdit ? t.done : t.edit}
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <div className="text">{canEdit ? "No rows yet — tap Add Row below." : "This storage has no rows yet."}</div>
        </div>
      ) : rows.map(row => (
        <div key={row.id}
          className={`row-block${selectedRowId === row.id ? " selected" : ""}`}
          onClick={() => canEdit && setSelectedRowId(row.id)}>
          <div className="row-label">
            <span>{t.row} {row.letter}</span>
            <span style={{ fontWeight: 600, fontSize: 10, opacity: 0.6 }}>
              {row.shelves.length} {row.shelves.length === 1 ? "drawer" : "drawers"}
            </span>
          </div>
          <div className="shelf-grid">
            {row.shelves.map(shelf => (
              <div key={shelf.id} className="shelf-wrap">
                {isEdit && canEdit && (
                  <button className="shelf-del" onClick={(e) => { e.stopPropagation(); removeShelf(row.id, shelf.id, shelf.coord); }}>×</button>
                )}
                <div className={`shelf ${shelf.isOpen ? "open" : "closed"}${!canEdit ? " readonly" : ""}`}
                  onClick={(e) => { e.stopPropagation(); handleShelfTap(row.id, shelf); }}>
                  <span className="shelf-coord">{shelf.coord}</span>
                  <span className="shelf-qty">{shelf.quantity}</span>
                  <span className="shelf-label">{shelf.label || t.empty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {canEdit && (
        <div className="inv-footer">
          <button className="f-btn"
            style={{ background: isEdit ? "linear-gradient(135deg,#F87171,#EF4444)" : "linear-gradient(135deg,var(--primary-dark),var(--primary))",
              color: isEdit ? "#fff" : "#000" }}
            onClick={isEdit ? removeRow : addRow}>
            {isEdit ? "✕ " + t.removeSelected : "+ " + t.addRow}
          </button>
          {!isEdit && (
            <button className="f-btn"
              style={{ background: "linear-gradient(135deg,#4ADE80,#22C55E)", color: "#fff" }}
              onClick={addShelf}>⊞ {t.addDrawer}</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EXPLORE TAB ──────────────────────────────────────────────────────────────

function ExploreTab() {
  // The "Storefront" — public storages (MVP §2). Users can search by handle,
  // see contents, and request to join.
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const [query, setQuery] = useState("");
  const [showToast, toastEl] = useToast();

  const publicStorages = useMemo(
    () => state.storages.filter(s => s.isPublic),
    [state.storages]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publicStorages;
    return publicStorages.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.handle?.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [publicStorages, query]);

  const requestJoin = (storage) => {
    if (storage.members?.[currentUser.id]) return;
    if (storage.joinRequests?.some(r => r.userId === currentUser.id)) return;
    dispatch((s) => {
      const target = s.storages.find(x => x.id === storage.id);
      if (target) {
        target.joinRequests = target.joinRequests || [];
        target.joinRequests.push({ userId: currentUser.id, requestedAt: Date.now() });
      }
    });
    showToast(t.requestSent);
  };

  return (
    <div>
      {toastEl}
      <div className="page-header">
        <div className="page-title">{t.explore}</div>
        <div className="page-sub">{t.publicStorages}</div>
      </div>
      <div className="search-wrap">
        <div className="search-bar">
          <span style={{ color: "var(--muted)", fontSize: 18 }}>⌕</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t.searchPlaceholder} />
          {query && <span style={{ cursor: "pointer", color: "var(--muted)", fontSize: 16 }} onClick={() => setQuery("")}>✕</span>}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          <div className="icon">{query ? "🔍" : "🌐"}</div>
          <div className="text">{query ? t.noResults : t.exploreHint}</div>
        </div>
      ) : results.map(s => {
        const isMember = !!s.members?.[currentUser.id];
        const isPending = s.joinRequests?.some(r => r.userId === currentUser.id);
        const memberCount = Object.keys(s.members || {}).length;
        return (
          <div key={s.id} className="card user-card" style={{ margin: "0 20px 12px" }}>
            <div className="user-avatar">{s.name[0].toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{s.name}</div>
              <div className="user-tag">{s.handle} · {memberCount} {t.members} · {visibleRows(s.rows).length} {t.row.toLowerCase()}s</div>
            </div>
            <button
              className={`join-btn${isMember ? " member" : isPending ? " pending" : ""}`}
              disabled={isMember || isPending}
              onClick={() => requestJoin(s)}>
              {isMember ? t.alreadyMember : isPending ? t.pending : t.join}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────

function OrdersTab() {
  // Logistics pipeline (MVP §3). The user's "view" depends on their CURRENT role
  // in the CURRENT storage — not a global toggle. We pick the storage scope
  // explicitly via a dropdown so the user sees what they can act on.
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const [showToast, toastEl] = useToast();
  const [warehouseModal, setWarehouseModal] = useState(null); // { orderId, storageId }
  const [warehouseChoice, setWarehouseChoice] = useState("");

  // Determine which storage scope to use. Default: first storage where this user has a role.
  const myStorages = state.storages.filter(s => s.members?.[currentUser.id]);
  const [scopeId, setScopeId] = useState(myStorages[0]?.id || null);
  const scope = scopeId ? state.storages.find(s => s.id === scopeId) : null;
  const myRole = scope ? getRole(scope, currentUser.id) : null;

  // Form state for creating an order (Student or Teacher)
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");

  const ordersInScope = useMemo(
    () => state.orders.filter(o => o.storageId === scopeId).sort((a, b) => b.createdAt - a.createdAt),
    [state.orders, scopeId]
  );

  const statusLabel = (s) => ({
    [STATUS.PENDING_TEACHER]: t.pendingTeacher,
    [STATUS.PENDING_HOD]: t.pendingHOD,
    [STATUS.PENDING_FINANCE]: t.pendingFinance,
    [STATUS.PENDING_WAREHOUSE]: t.pendingWarehouse,
    [STATUS.COMPLETED]: t.completed,
    [STATUS.REJECTED]: t.rejected,
  })[s] || s;

  const statusBadgeClass = (s) =>
    s === STATUS.COMPLETED ? "status-badge status-done"
    : s === STATUS.REJECTED ? "status-badge status-rejected"
    : "status-badge status-pending";

  const create = () => {
    if (!name.trim() || !qty.trim() || !scope) return;
    dispatch((s) => {
      const id = newId("order", s);
      // Per MVP §3: Student sends to Teacher; Teacher creates and routes directly to HOD pipeline,
      // but must select a target Warehouse.
      const startStatus = myRole === "Student" ? STATUS.PENDING_TEACHER : STATUS.PENDING_HOD;
      s.orders.unshift({
        id, storageId: scope.id, item: name.trim(), quantity: qty,
        status: startStatus,
        requesterId: currentUser.id, requesterUsername: currentUser.username,
        warehouseId: null, createdAt: Date.now(),
        history: [{ status: startStatus, by: currentUser.id, at: Date.now() }],
      });
    });
    setName(""); setQty(""); showToast(t.orderSent);
  };

  // Approve action — Teacher must select a warehouse before forwarding
  const approve = (order) => {
    if (myRole === "Teacher" && !order.warehouseId) {
      // Open warehouse picker first
      setWarehouseModal({ orderId: order.id, storageId: order.storageId });
      setWarehouseChoice(scope?.warehouses?.[0]?.id || "");
      return;
    }
    finishApprove(order, order.warehouseId);
  };

  const finishApprove = (order, whId) => {
    dispatch((s) => {
      const o = s.orders.find(x => x.id === order.id);
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
      const o = s.orders.find(x => x.id === order.id);
      if (!o) return;
      o.status = STATUS.REJECTED;
      o.history.push({ status: STATUS.REJECTED, by: currentUser.id, at: Date.now() });
    });
    showToast("Rejected");
  };

  const confirmWarehousePick = () => {
    if (!warehouseChoice) return;
    const order = state.orders.find(o => o.id === warehouseModal.orderId);
    if (!order) return;
    finishApprove(order, warehouseChoice);
    showToast(t.warehouseSelectedToast);
    setWarehouseModal(null); setWarehouseChoice("");
  };

  if (!scope) {
    return (
      <div>
        <div className="page-header"><div className="page-title">{t.orders}</div></div>
        <div className="empty-state"><div className="icon">📋</div><div className="text">{t.inventoryEmpty}</div></div>
      </div>
    );
  }

  return (
    <div>
      {toastEl}
      <div className="page-header">
        <div className="page-title">{t.orders}</div>
        <div className="page-sub">{t.forStorage} {scope.name}</div>
      </div>

      {/* Storage scope picker — orders are always tied to a storage */}
      {myStorages.length > 1 && (
        <div style={{ padding: "0 20px 14px" }}>
          <select className="modal-select" value={scopeId || ""} onChange={e => setScopeId(e.target.value)}>
            {myStorages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      <div className="role-banner">
        <span className="icon">👤</span>
        <div className="text">
          <div className="label">{t.role}</div>
          <div className="value">{myRole}</div>
        </div>
      </div>

      {/* Student / Teacher can create */}
      {(myRole === "Student" || myRole === "Teacher") && (
        <div className="order-form">
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{t.createOrder}</div>
          <input className="order-input" placeholder={t.productName} value={name} onChange={e => setName(e.target.value)} />
          <input className="order-input" placeholder={t.quantity} type="number" inputMode="numeric"
            value={qty} onChange={e => setQty(e.target.value)} />
          <button className="order-submit" onClick={create}>{t.sendRequest}</button>
        </div>
      )}

      <div style={{ padding: "0 20px 8px", fontSize: 13, fontWeight: 800, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 1 }}>
        {t.orderList}
      </div>
      {ordersInScope.length === 0 && (
        <div className="empty-state"><div className="text">{t.noOrders}</div></div>
      )}
      {ordersInScope.map(o => {
        const canAct = canActOnOrder(o, myRole);
        const requesterUser = state.users.find(u => u.id === o.requesterId);
        const wh = scope.warehouses?.find(w => w.id === o.warehouseId);
        return (
          <div key={o.id} className="card order-card">
            <div className="order-card-top">
              <div className="order-item">📦 {o.item} ×{o.quantity}</div>
              <div className={statusBadgeClass(o.status)}>{statusLabel(o.status)}</div>
            </div>
            <div className="order-by">{t.requestedBy}: {requesterUser?.handle || o.requesterUsername}</div>
            {wh && <div className="order-storage">→ {wh.name}</div>}
            {canAct && (
              <div className="order-actions">
                <button className="action-btn btn-reject" onClick={() => reject(o)}>{t.reject}</button>
                <button className="action-btn btn-approve" onClick={() => approve(o)}>
                  {myRole === "Warehouse" ? t.deliverProduct : t.approve}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {warehouseModal && (
        <div className="modal-backdrop" onClick={() => setWarehouseModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t.selectWarehouse}</div>
            {scope.warehouses?.length ? (
              <select className="modal-select" value={warehouseChoice} onChange={e => setWarehouseChoice(e.target.value)}>
                <option value="">{t.chooseWarehouse}</option>
                {scope.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            ) : (
              <div className="auth-info" style={{ marginBottom: 12 }}>{t.noWarehouses}</div>
            )}
            <button className="modal-save" disabled={!warehouseChoice} onClick={confirmWarehousePick}
              style={{ opacity: warehouseChoice ? 1 : 0.5 }}>{t.save}</button>
            <button className="modal-cancel" onClick={() => setWarehouseModal(null)}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────

function SettingsTab({ darkMode, setDarkMode, lang, setLang, onLogout }) {
  const { t } = useLang();
  const { state, dispatch, currentUser, setCurrentUser } = useApp();
  const [notifs, setNotifs] = useState(true);
  const [pubProfile, setPubProfile] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [pwModal, setPwModal] = useState(false);
  const [showToast, toastEl] = useToast();

  const SettingRow = ({ icon, label, type, value, onPress, danger, iconBg }) => (
    <div className={`setting-item card${danger ? " danger" : ""}`}
      onClick={type === "switch" ? undefined : onPress}
      style={{ margin: "0 20px 10px", cursor: type === "switch" ? "default" : "pointer" }}>
      <div className="setting-icon" style={{ background: danger ? "#FEE2E2" : (iconBg || "rgba(255,217,61,0.22)"),
        border: `1px solid ${danger ? "#FCA5A5" : "rgba(255,193,7,0.3)"}` }}>{icon}</div>
      <div className="setting-label">{label}</div>
      {type === "switch" ? (
        <label className="switch">
          <input type="checkbox" checked={!!value} onChange={onPress} />
          <span className="slider" />
        </label>
      ) : <span className="setting-chevron">›</span>}
    </div>
  );

  if (showAdmin) return <HierarchyView onBack={() => setShowAdmin(false)} />;
  if (editProfile) return <EditProfileView onBack={() => setEditProfile(false)} />;
  if (pwModal) return <ChangePasswordView onBack={() => setPwModal(false)} />;

  return (
    <div style={{ paddingBottom: 32 }}>
      {toastEl}
      <div className="page-header"><div className="page-title">{t.settings}</div></div>

      <div className="card profile-card">
        <div className="profile-avatar">{currentUser.username[0].toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="profile-name">{currentUser.username}</div>
          <div className="profile-tag">{currentUser.handle}</div>
        </div>
        <button className="edit-profile-btn" onClick={() => setEditProfile(true)}>{t.editProfile}</button>
      </div>

      <div className="settings-section">{t.organization}</div>
      <SettingRow icon="👥" label={t.teamHierarchy} onPress={() => setShowAdmin(true)} />

      <div className="settings-section">{t.preferences}</div>
      <SettingRow icon="🔔" label={t.pushNotifications} type="switch" value={notifs} onPress={() => setNotifs(p => !p)} />
      <SettingRow icon="👁" label={t.publicProfile} type="switch" value={pubProfile} onPress={() => setPubProfile(p => !p)} />
      <SettingRow icon="🌙" label={t.darkMode} type="switch" value={darkMode} onPress={() => setDarkMode(p => !p)} />
      <SettingRow icon="🌐" label={`${t.language}: ${lang === "en" ? "English" : "Shqip"}`}
        onPress={() => setLang(l => l === "en" ? "sq" : "en")} />

      <div className="settings-section">{t.accountSecurity}</div>
      <SettingRow icon="🔑" label={t.changePassword} onPress={() => setPwModal(true)} />
      <SettingRow icon="🛡" label={t.privacyPolicy} onPress={() => showToast("Privacy policy lives at beex.io/privacy.")} />

      <div style={{ marginTop: 14 }}>
        <SettingRow icon="🚪" label={t.logout} danger onPress={onLogout} />
      </div>
      <div className="version-text">{t.version}</div>
    </div>
  );
}

// ─── ADMIN: Team & Hierarchy (MVP §4) ─────────────────────────────────────────
function HierarchyView({ onBack }) {
  // God-mode overlay. Search → assign roles → toggle Admin per-user, per-storage.
  // Owner row is locked (cannot be demoted) — MVP §4 Safety Lock.
  const { t } = useLang();
  const { state, dispatch, currentUser } = useApp();
  const myStorages = state.storages.filter(s => isAdmin(s, currentUser.id));
  const [scopeId, setScopeId] = useState(myStorages[0]?.id || null);
  const [search, setSearch] = useState("");
  const [roleModal, setRoleModal] = useState(null); // { userId, currentRole }
  const [showToast, toastEl] = useToast();

  const scope = scopeId ? state.storages.find(s => s.id === scopeId) : null;

  const memberRows = useMemo(() => {
    if (!scope) return [];
    const q = search.trim().toLowerCase();
    return Object.entries(scope.members || {})
      .map(([userId, m]) => {
        const u = state.users.find(x => x.id === userId);
        return { userId, user: u, role: m.role, isAdmin: !!m.isAdmin, isOwner: scope.ownerId === userId };
      })
      .filter(r => !q || r.user?.username.toLowerCase().includes(q) || r.user?.handle?.toLowerCase().includes(q));
  }, [scope, state.users, search]);

  const setRole = (userId, role) => {
    dispatch((s) => {
      const target = s.storages.find(x => x.id === scopeId);
      if (target?.members?.[userId]) target.members[userId].role = role;
    });
    setRoleModal(null);
  };

  const toggleAdmin = (userId, isOwnerRow) => {
    if (isOwnerRow) { showToast(t.ownerLockMsg); return; } // Safety lock
    dispatch((s) => {
      const target = s.storages.find(x => x.id === scopeId);
      if (target?.members?.[userId]) target.members[userId].isAdmin = !target.members[userId].isAdmin;
    });
  };

  if (!scope) {
    return (
      <div>
        <div className="page-header">
          <button className="page-back" onClick={onBack}>‹ {t.back}</button>
          <div className="page-title">{t.manageUsers}</div>
        </div>
        <div className="empty-state"><div className="text">You are not an Admin in any storage yet.</div></div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 24 }}>
      {toastEl}
      <div className="page-header">
        <button className="page-back" onClick={onBack}>‹ {t.back}</button>
        <div className="page-title">{t.manageUsers}</div>
        <div className="page-sub">{t.assignRoles}</div>
      </div>

      {myStorages.length > 1 && (
        <div style={{ padding: "0 20px 12px" }}>
          <select className="modal-select" value={scopeId} onChange={e => setScopeId(e.target.value)}>
            {myStorages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      <div className="search-wrap">
        <div className="search-bar">
          <span style={{ color: "var(--muted)", fontSize: 18 }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
        </div>
      </div>

      {memberRows.length === 0 ? (
        <div className="empty-state"><div className="text">{t.noResults}</div></div>
      ) : memberRows.map(r => (
        <div key={r.userId} className="card admin-card">
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="admin-uname">
              👤 {r.user?.username || r.userId}
              {r.isOwner && <span className="lock" title={t.ownerLockMsg}>🔒</span>}
            </div>
            <div className="admin-role">{r.role} {r.isAdmin && "· Admin"}</div>
          </div>
          <div className="admin-actions">
            <div className="admin-toggle">
              <span className="label">{t.adminToggle}</span>
              <label className="switch">
                <input type="checkbox" checked={r.isAdmin} disabled={r.isOwner}
                  onChange={() => toggleAdmin(r.userId, r.isOwner)} />
                <span className="slider" />
              </label>
            </div>
            <button className="admin-edit" disabled={r.isOwner} onClick={() => setRoleModal({ userId: r.userId, role: r.role })}>
              {t.changeRole}
            </button>
          </div>
        </div>
      ))}

      {roleModal && (
        <div className="modal-backdrop" onClick={() => setRoleModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t.selectRole}</div>
            {ROLES.map(r => (
              <button key={r}
                className={`role-option${roleModal.role === r ? " selected" : ""}`}
                onClick={() => setRole(roleModal.userId, r)}>{r}</button>
            ))}
            <button className="modal-close-btn" onClick={() => setRoleModal(null)}>{t.cancel}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE EDITOR ───────────────────────────────────────────────────────────
function EditProfileView({ onBack }) {
  const { t } = useLang();
  const { state, dispatch, currentUser, setCurrentUser } = useApp();
  const [form, setForm] = useState({
    username: currentUser.username, handle: currentUser.handle, email: currentUser.email,
  });
  const [error, setError] = useState("");
  const [showToast, toastEl] = useToast();

  const save = () => {
    setError("");
    if (!form.username.trim() || !form.handle.trim() || !form.email.trim()) { setError(t.fieldRequired); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(t.invalidEmail); return; }
    if (state.users.some(u => u.id !== currentUser.id && u.username.toLowerCase() === form.username.trim().toLowerCase())) { setError(t.usernameTaken); return; }
    const cleanHandle = form.handle.startsWith("@") ? form.handle : `@${form.handle}`;
    if (state.users.some(u => u.id !== currentUser.id && u.handle.toLowerCase() === cleanHandle.toLowerCase())) { setError(t.handleTaken); return; }
    dispatch((s) => {
      const u = s.users.find(x => x.id === currentUser.id);
      if (u) { u.username = form.username.trim(); u.handle = cleanHandle; u.email = form.email.trim(); }
    });
    setCurrentUser({ ...currentUser, username: form.username.trim(), handle: cleanHandle, email: form.email.trim() });
    showToast(t.profileUpdated);
    setTimeout(onBack, 700);
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {toastEl}
      <div className="page-header">
        <button className="page-back" onClick={onBack}>‹ {t.back}</button>
        <div className="page-title">{t.editProfileTitle}</div>
      </div>
      <div style={{ padding: "0 20px" }}>
        {error && <div className="auth-error">{error}</div>}
        <input className="auth-input" placeholder={t.username} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <input className="auth-input" placeholder={t.handle} value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} />
        <input className="auth-input" placeholder={t.email} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <button className="auth-btn" onClick={save}>{t.saveChanges}</button>
      </div>
    </div>
  );
}

function ChangePasswordView({ onBack }) {
  const { t } = useLang();
  const { dispatch, currentUser } = useApp();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [showToast, toastEl] = useToast();

  const save = () => {
    setError("");
    if (!form.current || !form.next || !form.confirm) { setError(t.fieldRequired); return; }
    if (form.next !== form.confirm) { setError(t.passwordMismatch); return; }
    if (currentUser.password && form.current !== currentUser.password) { setError(t.wrongCurrentPassword); return; }
    dispatch((s) => {
      const u = s.users.find(x => x.id === currentUser.id);
      if (u) u.password = form.next;
    });
    showToast(t.passwordChanged);
    setTimeout(onBack, 700);
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {toastEl}
      <div className="page-header">
        <button className="page-back" onClick={onBack}>‹ {t.back}</button>
        <div className="page-title">{t.changePassword}</div>
      </div>
      <div style={{ padding: "0 20px" }}>
        {error && <div className="auth-error">{error}</div>}
        <input className="auth-input" type="password" placeholder={t.currentPassword} value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
        <input className="auth-input" type="password" placeholder={t.newPassword} value={form.next} onChange={e => setForm({ ...form, next: e.target.value })} />
        <input className="auth-input" type="password" placeholder={t.confirmNewPassword} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
        <button className="auth-btn" onClick={save}>{t.saveChanges}</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function BeexStorageApp() {
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState(0);
  const [state, setState] = useState(loadState);

  // Persist whenever state changes
  useEffect(() => { saveState(state); }, [state]);

  // FIX: apply dark mode to html element so body background flips too
  useEffect(() => {
    document.documentElement.dataset.dark = dark ? "true" : "false";
  }, [dark]);

  const t = T[lang];

  // dispatch lets components mutate state via a draft function
  const dispatch = useCallback((mutator) => {
    setState((prev) => {
      const draft = JSON.parse(JSON.stringify(prev));
      mutator(draft);
      return draft;
    });
  }, []);

  const login = (user) => { setCurrentUser(user); setScreen("main"); };
  const logout = () => { setCurrentUser(null); setScreen("login"); setTab(0); };

  const tabs = [
    { id: 0, label: t.inventory, icon: "🗂", node: () => <InventoryTab /> },
    { id: 1, label: t.explore, icon: "🔍", node: () => <ExploreTab /> },
    { id: 2, label: t.orders, icon: "📦", node: () => <OrdersTab /> },
    { id: 3, label: t.settings, icon: "⚙", node: () => <SettingsTab darkMode={dark} setDarkMode={setDark} lang={lang} setLang={setLang} onLogout={logout} /> },
  ];

  return (
    <LangContext.Provider value={{ t, lang, setLang }}>
      <AppContext.Provider value={{ state, dispatch, currentUser, setCurrentUser }}>
        <style>{appCss}</style>
        <div className="app" data-dark={dark.toString()}>
          {screen === "login" && <LoginScreen onLogin={login} onGoSignup={() => setScreen("signup")} />}
          {screen === "signup" && <SignupScreen onGoLogin={() => setScreen("login")} />}
          {screen === "main" && currentUser && (
            <div className="app-shell">
              {/* Sidebar — desktop ≥ 1024px (MVP §5) */}
              <aside className="sidebar">
                <div className="sidebar-brand">
                  <img src={logo} alt="" />
                  <div>
                    <div className="name">{t.appName}</div>
                    <div className="tag">{t.tagline}</div>
                  </div>
                </div>
                {tabs.map(tb => (
                  <button key={tb.id} className={`sidebar-tab${tab === tb.id ? " active" : ""}`} onClick={() => setTab(tb.id)}>
                    <span className="icon">{tb.icon}</span>
                    <span>{tb.label}</span>
                  </button>
                ))}
                <div className="sidebar-user">
                  <div className="avatar-sm">{currentUser.username[0].toUpperCase()}</div>
                  <div className="name-block">
                    <strong>{currentUser.username}</strong>
                    <span>{currentUser.handle}</span>
                  </div>
                </div>
              </aside>

                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden" }}>                {/* Mobile header */}
                <header className="header">
                  <div className="header-brand">
                    <img src={logo} alt="" className="header-logo-img" />
                    <div className="header-logo">{t.appName}</div>
                  </div>
                  <div className="header-user">
                    <div className="avatar-sm" onClick={() => setTab(3)}>{currentUser.username[0].toUpperCase()}</div>
                  </div>
                </header>

                <main className="main">
                  {tabs.find(x => x.id === tab)?.node()}
                </main>

                {/* Bottom tabs — mobile (MVP §5) */}
                <nav className="tab-bar">
                  {tabs.map(tb => (
                    <button key={tb.id} className={`tab${tab === tb.id ? " active" : ""}`} onClick={() => setTab(tb.id)}>
                      <span className="tab-icon">{tb.icon}</span>
                      <span>{tb.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </AppContext.Provider>
    </LangContext.Provider>
  );
}
