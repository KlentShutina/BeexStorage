export const appCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --primary: #FFD93D;
    --primary-dark: #FFC107;
    --primary-deep: #FFB300;
    --accent: #1C1C1E;
    --blue: #007AFF;
    --green: #34C759;
    --red: #FF3B30;
    --orange: #FF9500;
    --bg: #F5F5F7;
    --surface: #FFFFFF;
    --surface-2: #FAFAFA;
    --border: #E5E5EA;
    --text: #1C1C1E;
    --text-2: #5C5C5E;
    --muted: #8E8E93;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
    --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.12);
    --radius: 20px;
    --radius-sm: 12px;
    --radius-md: 16px;
    --tab-height: 76px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 16px;
    color: var(--text);
    background: var(--bg);
  }

  /* Dark mode variables — applied to .app div AND html element (via useEffect) */
  [data-dark="true"] {
    --bg: #000000;
    --surface: #1C1C1E;
    --surface-2: #2C2C2E;
    --border: #38383A;
    --text: #F2F2F7;
    --text-2: #C7C7CC;
    --muted: #8E8E93;
    --shadow: 0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.25);
    --shadow-lg: 0 16px 48px rgba(0,0,0,0.6);
  }

  /* Ensure html + body go dark too — fixes the white body bleeding through */
  html[data-dark="true"],
  html[data-dark="true"] body {
    background: #000000 !important;
    color: #F2F2F7;
  }

  body { background: var(--bg); color: var(--text); }
  button { font-family: inherit; }
  input, textarea, select { font-family: inherit; color: var(--text); }

  /* FIX: use 100dvh (dynamic viewport height) so the app exactly fills the
     visible browser area on mobile, preventing the blank space below the tab bar */
  html, body, #root {
    height: 100%;
  }
  .app {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    overflow: hidden;
  }

  /* AUTH */
  .auth-wrap { flex: 1; display: flex; align-items: center; justify-content: center; padding: 24px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 60%, var(--primary-deep) 100%); overflow-y: auto; }
  .auth-card { background: var(--surface); border-radius: var(--radius); padding: 36px 28px; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); border: 1px solid rgba(0,0,0,0.04); }
  .auth-logo-row { display: flex; flex-direction: column; align-items: center; gap: 14px; margin-bottom: 18px; }
  .auth-logo-img { width: 82px; height: 82px; border-radius: 22px; box-shadow: 0 10px 24px rgba(0,0,0,0.15); }
  .auth-title { font-size: 26px; font-weight: 800; color: var(--text); text-align: center; letter-spacing: -0.5px; }
  .auth-sub { text-align: center; color: var(--text-2); font-size: 14px; margin-bottom: 24px; font-weight: 500; }
  .auth-input { width: 100%; padding: 14px 16px; border: 2px solid var(--border); border-radius: var(--radius-sm); font-size: 15px; background: var(--surface); color: var(--text); outline: none; transition: all .2s; margin-bottom: 12px; font-weight: 500; }
  .auth-input:focus { border-color: var(--primary-dark); box-shadow: 0 0 0 4px rgba(255,217,61,0.18); }
  .auth-btn { width: 100%; padding: 15px; border-radius: var(--radius-sm); border: none; font-size: 16px; font-weight: 800; cursor: pointer; background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%); color: #000; margin-top: 6px; transition: all .2s; box-shadow: 0 4px 12px rgba(255,193,7,0.32); letter-spacing: 0.2px; }
  .auth-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255,193,7,0.45); }
  .auth-btn:active { transform: translateY(0); }
  .auth-btn:disabled { opacity: 0.55; cursor: default; transform: none; box-shadow: none; }
  .auth-link { text-align: center; color: var(--accent); font-size: 14px; margin-top: 18px; cursor: pointer; font-weight: 600; transition: opacity .2s; padding: 8px; }
  .auth-link:hover { opacity: 0.65; }
  .auth-link b { color: var(--primary-deep); }
  .auth-error { background: #FEE2E2; color: #991B1B; padding: 11px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; font-weight: 600; border: 1px solid #FCA5A5; }
  .auth-info { background: rgba(255,217,61,0.18); color: #856404; padding: 10px 14px; border-radius: 10px; font-size: 12px; margin-bottom: 12px; font-weight: 500; border: 1px solid rgba(255,193,7,0.3); }

  /* HEADER */
  .header { background: rgba(255,255,255,0.85); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); padding: 0 20px; height: 64px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 100; }
  [data-dark="true"] .header { background: rgba(28,28,30,0.92); border-bottom-color: var(--border); }
  .header-brand { display: flex; align-items: center; gap: 10px; }
  .header-logo-img { width: 36px; height: 36px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
  .header-logo { font-size: 19px; font-weight: 800; color: var(--text); letter-spacing: -0.3px; }
  .header-user { display: flex; align-items: center; gap: 10px; }
  .avatar-sm { width: 38px; height: 38px; border-radius: 12px; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #000; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; box-shadow: 0 2px 8px rgba(255,193,7,0.3); cursor: pointer; }

  /* TAB BAR */
  .tab-bar { display: flex; background: rgba(255,255,255,0.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid var(--border); flex-shrink: 0; z-index: 100; box-shadow: 0 -2px 16px rgba(0,0,0,0.04); padding-bottom: env(safe-area-inset-bottom, 0); }
  [data-dark="true"] .tab-bar { background: rgba(28,28,30,0.95); border-top-color: var(--border); }
  .tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 4px 14px; gap: 4px; cursor: pointer; color: var(--muted); font-size: 11px; font-weight: 600; border: none; background: none; transition: all .2s; position: relative; }
  .tab.active { color: var(--primary-deep); }
  .tab.active::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 32px; height: 3px; background: var(--primary); border-radius: 0 0 3px 3px; }
  .tab-icon { font-size: 22px; line-height: 1; transition: transform .2s; }
  .tab.active .tab-icon { transform: scale(1.12); }

  /* SIDEBAR (desktop ≥ 1024px) */
  @media (min-width: 1024px) {
    .app-shell { display: grid; grid-template-columns: 280px 1fr; flex: 1; overflow: hidden; }
    .sidebar { display: flex !important; flex-direction: column; background: var(--surface); border-right: 1px solid var(--border); padding: 20px 14px; gap: 6px; overflow-y: auto; }
    .tab-bar { display: none !important; }
    .header { display: none !important; }
    .sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 8px 12px 18px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
    .sidebar-brand img { width: 44px; height: 44px; border-radius: 12px; }
    .sidebar-brand .name { font-size: 19px; font-weight: 800; color: var(--text); }
    .sidebar-brand .tag { font-size: 11px; color: var(--text-2); }
    .sidebar-tab { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 12px; cursor: pointer; color: var(--text-2); font-size: 15px; font-weight: 600; border: none; background: none; transition: all .2s; text-align: left; width: 100%; }
    .sidebar-tab:hover { background: var(--surface-2); }
    .sidebar-tab.active { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #000; box-shadow: 0 4px 12px rgba(255,193,7,0.3); }
    .sidebar-tab .icon { font-size: 22px; line-height: 1; }
    .sidebar-user { margin-top: auto; padding: 12px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
    .sidebar-user .avatar-sm { width: 36px; height: 36px; }
    .sidebar-user .name-block { display: flex; flex-direction: column; min-width: 0; }
    .sidebar-user .name-block strong { font-size: 14px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sidebar-user .name-block span { font-size: 12px; color: var(--text-2); }
    .main { flex: 1; overflow-y: auto; }
  }

  /* MOBILE layout fix — inner column fills full height */
  @media (max-width: 1023px) {
    .sidebar { display: none !important; }
    .app-shell {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      /* fills the space between top of .app and bottom of screen */
      height: 100%;
    }
    .main { flex: 1; overflow-y: auto; }
  }

  /* PAGE */
  .page-header { padding: 22px 20px 14px; }
  .page-title { font-size: 30px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
  .page-sub { font-size: 14px; color: var(--text-2); margin-top: 4px; font-weight: 500; }
  .page-back { display: inline-flex; align-items: center; gap: 6px; color: var(--primary-deep); font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 10px; background: none; border: none; padding: 4px 0; transition: opacity .2s; }
  .page-back:hover { opacity: 0.7; }

  /* CARDS */
  .card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow); transition: all .2s; }
  .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06); }
  .card-pad { padding: 18px; }

  /* INVENTORY */
  .sys-card { padding: 18px; margin: 0 20px 12px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: transform .15s; }
  .sys-card:active { transform: scale(0.985); }
  .sys-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(255,193,7,0.3); }
  .sys-name { font-size: 16px; font-weight: 800; color: var(--text); }
  .sys-status { font-size: 12px; color: var(--text-2); margin-top: 4px; font-weight: 500; }
  .sys-handle { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .role-pill { font-size: 10px; font-weight: 800; color: var(--primary-deep); background: rgba(255,217,61,0.22); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(255,193,7,0.32); text-transform: uppercase; letter-spacing: 0.5px; }
  .role-pill.owner { color: #fff; background: linear-gradient(135deg,#FFC107,#FFB300); border-color: transparent; }
  .pair-btn { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #000; border: none; border-radius: 11px; padding: 10px 14px; font-size: 13px; font-weight: 800; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 8px rgba(255,193,7,0.3); transition: all .2s; }
  .pair-btn:hover { transform: translateY(-1px); }
  .scan-fab { position: fixed; right: 20px; bottom: calc(var(--tab-height) + 18px); width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); border: none; cursor: pointer; box-shadow: 0 6px 20px rgba(255,193,7,0.45); font-size: 26px; color: #000; display: flex; align-items: center; justify-content: center; z-index: 90; transition: all .2s; }
  @media (min-width: 1024px) { .scan-fab { bottom: 28px; right: 28px; } }
  .scan-fab:hover { transform: scale(1.05); }

  /* SCANNER MODAL */
  .scan-viewport { width: 100%; aspect-ratio: 4/3; background: #0a0a0a; border-radius: 12px; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; border: 2px solid var(--primary); }
  .scan-corner { position: absolute; width: 24px; height: 24px; border-color: var(--primary); border-style: solid; border-width: 0; }
  .scan-corner.tl { top: 8px; left: 8px; border-top-width: 3px; border-left-width: 3px; border-radius: 4px 0 0 0; }
  .scan-corner.tr { top: 8px; right: 8px; border-top-width: 3px; border-right-width: 3px; border-radius: 0 4px 0 0; }
  .scan-corner.bl { bottom: 8px; left: 8px; border-bottom-width: 3px; border-left-width: 3px; border-radius: 0 0 0 4px; }
  .scan-corner.br { bottom: 8px; right: 8px; border-bottom-width: 3px; border-right-width: 3px; border-radius: 0 0 4px 0; }
  .scan-line { position: absolute; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, transparent, var(--primary), transparent); animation: bxScanline 2s ease-in-out infinite; box-shadow: 0 0 8px var(--primary); }
  @keyframes bxScanline { 0%,100% { top: 15%; opacity: 0.6; } 50% { top: 80%; opacity: 1; } }
  .scan-camera-icon { font-size: 40px; opacity: 0.35; }

  /* EMPTY STATE */
  .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 30px; gap: 12px; }
  .empty-icon { font-size: 52px; opacity: 0.5; }
  .empty-text { color: var(--text-2); font-size: 14px; font-weight: 500; text-align: center; line-height: 1.5; }

  /* INVENTORY DETAIL — rows / shelves */
  .row-section { margin: 0 20px 14px; }
  .row-label { font-size: 11px; font-weight: 800; color: var(--text-2); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  .shelf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(72px, 1fr)); gap: 10px; }
  .shelf-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; height: 80px; border-radius: 12px; border: 2px solid var(--border); background: var(--surface-2); cursor: pointer; transition: all .2s; padding: 6px; color: var(--text); font-family: inherit; }
  .shelf-btn:active { transform: scale(0.95); }
  .shelf-btn.open { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); border-color: transparent; color: #000; box-shadow: 0 3px 10px rgba(255,193,7,0.35); }
  .shelf-coord { font-size: 9px; font-weight: 800; opacity: 0.6; text-transform: uppercase; }
  .shelf-qty { font-size: 20px; font-weight: 800; line-height: 1; }
  .shelf-label { font-size: 8px; font-weight: 600; opacity: 0.75; text-align: center; max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .add-shelf-btn { height: 80px; border-radius: 12px; border: 2px dashed var(--border); background: transparent; color: var(--muted); font-size: 22px; cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center; }
  .add-shelf-btn:hover { border-color: var(--primary); color: var(--primary-deep); background: rgba(255,217,61,0.07); }
  .edit-shelf-badge { position: absolute; top: -6px; right: -6px; background: var(--red); color: #fff; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; }
  .shelf-wrap { position: relative; }

  /* ROLE BANNER */
  .role-banner { margin: 0 20px 14px; padding: 12px 16px; border-radius: 14px; background: rgba(255,217,61,0.13); border: 1px solid rgba(255,193,7,0.25); display: flex; align-items: center; gap: 10px; }
  .role-banner-icon { font-size: 20px; }
  .role-banner-text { font-size: 12px; color: var(--text-2); font-weight: 600; }
  .role-banner-name { font-size: 14px; font-weight: 800; color: var(--primary-deep); }

  /* ORDERS */
  .scope-row { padding: 0 20px 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .scope-select { flex: 1; min-width: 140px; padding: 10px 14px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; font-weight: 600; background: var(--surface); color: var(--text); outline: none; cursor: pointer; transition: border-color .2s; font-family: inherit; }
  .scope-select:focus { border-color: var(--primary); }
  .order-form { margin: 0 20px 16px; padding: 16px; border-radius: var(--radius); background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
  .order-form-title { font-size: 13px; font-weight: 800; color: var(--primary-deep); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
  .order-inputs { display: flex; gap: 10px; flex-wrap: wrap; }
  .order-inputs input { flex: 1; min-width: 120px; padding: 11px 13px; border: 2px solid var(--border); border-radius: 12px; font-size: 14px; background: var(--surface); color: var(--text); outline: none; transition: border-color .2s; font-family: inherit; }
  .order-inputs input:focus { border-color: var(--primary); }
  .order-submit { padding: 11px 18px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #000; font-weight: 800; font-size: 14px; cursor: pointer; white-space: nowrap; transition: all .2s; box-shadow: 0 2px 8px rgba(255,193,7,0.3); }
  .order-submit:hover { transform: translateY(-1px); }
  .order-list { padding: 0 20px; }
  .order-card { padding: 16px; margin-bottom: 12px; }
  .order-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
  .order-item { font-size: 15px; font-weight: 800; color: var(--text); }
  .order-by { font-size: 12px; color: var(--text-2); font-weight: 500; margin-bottom: 4px; }
  .order-wh { font-size: 11px; color: var(--primary-deep); font-weight: 700; margin-bottom: 8px; }
  .status-badge { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 8px; white-space: nowrap; }
  .status-PENDING_TEACHER  { background: #FFF3CD; color: #856404; border: 1px solid #FFE69C; }
  .status-PENDING_HOD      { background: #FFF3CD; color: #856404; border: 1px solid #FFE69C; }
  .status-PENDING_FINANCE  { background: #FFF3CD; color: #856404; border: 1px solid #FFE69C; }
  .status-PENDING_WAREHOUSE{ background: #DBEAFE; color: #1E40AF; border: 1px solid #BFDBFE; }
  .status-COMPLETED        { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
  .status-REJECTED         { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
  /* dark mode status badges */
  [data-dark="true"] .status-PENDING_TEACHER,
  [data-dark="true"] .status-PENDING_HOD,
  [data-dark="true"] .status-PENDING_FINANCE  { background: rgba(255,193,7,0.18); color: #FCD34D; border-color: rgba(255,193,7,0.3); }
  [data-dark="true"] .status-PENDING_WAREHOUSE { background: rgba(96,165,250,0.18); color: #93C5FD; border-color: rgba(96,165,250,0.3); }
  [data-dark="true"] .status-COMPLETED         { background: rgba(52,211,153,0.18); color: #6EE7B7; border-color: rgba(52,211,153,0.3); }
  [data-dark="true"] .status-REJECTED          { background: rgba(251,113,133,0.18); color: #FDA4AF; border-color: rgba(251,113,133,0.3); }
  .order-actions { display: flex; gap: 8px; margin-top: 12px; }
  .btn-approve { flex: 1; padding: 11px; border-radius: 12px; border: none; font-size: 14px; font-weight: 800; cursor: pointer; transition: all .2s; background: linear-gradient(135deg, #4ADE80, #22C55E); color: #fff; box-shadow: 0 2px 8px rgba(34,197,94,0.3); }
  .btn-approve:hover { transform: translateY(-1px); }
  .btn-reject { background: linear-gradient(135deg, #F87171, #EF4444); color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
  .btn-reject:hover { transform: translateY(-1px); }
  .order-storage { font-size: 11px; color: var(--muted); margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }

  /* SETTINGS */
  .profile-card { padding: 18px; margin: 0 20px 16px; display: flex; align-items: center; gap: 14px; }
  .profile-avatar { width: 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #000; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 800; box-shadow: 0 4px 12px rgba(255,193,7,0.3); flex-shrink: 0; }
  .profile-name { font-size: 17px; font-weight: 800; color: var(--text); }
  .profile-tag { font-size: 13px; color: var(--text-2); margin-top: 2px; }
  .edit-profile-btn { background: var(--surface-2); border: none; border-radius: 11px; padding: 9px 16px; font-size: 13px; font-weight: 800; color: var(--primary-deep); cursor: pointer; transition: all .2s; }
  .edit-profile-btn:hover { background: rgba(255,217,61,0.22); }
  .settings-section { padding: 16px 20px 8px; font-size: 11px; color: var(--text-2); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
  .setting-item { display: flex; align-items: center; gap: 14px; padding: 14px; cursor: pointer; transition: all .2s; }
  .setting-item:active { transform: scale(0.985); }
  .setting-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 18px; }
  .setting-label { flex: 1; font-size: 15px; font-weight: 600; color: var(--text); }
  .setting-chevron { color: var(--muted); font-size: 20px; line-height: 1; }
  .setting-item.danger .setting-icon { background: #FEE2E2; border: 1px solid #FCA5A5; }
  .setting-item.danger .setting-label { color: var(--red); }
  [data-dark="true"] .setting-item.danger .setting-icon { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.3); }

  /* SWITCH */
  .switch { position: relative; width: 50px; height: 30px; flex-shrink: 0; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; inset: 0; background: #D1D1D6; border-radius: 30px; transition: background .25s; cursor: pointer; }
  .slider::before { content: ''; position: absolute; height: 26px; width: 26px; left: 2px; bottom: 2px; background: #fff; border-radius: 50%; transition: transform .25s; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
  .switch input:checked + .slider { background: var(--primary); }
  .switch input:checked + .slider::before { transform: translateX(20px); }
  [data-dark="true"] .slider { background: #48484A; }

  /* MODAL */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 250; padding: 20px; backdrop-filter: blur(4px); animation: bxFadeIn .2s ease; }
  .modal-box { background: var(--surface); border-radius: var(--radius); padding: 24px; width: 100%; max-width: 380px; box-shadow: var(--shadow-lg); }
  .modal-title { font-size: 18px; font-weight: 800; margin-bottom: 14px; text-align: center; color: var(--text); }
  .modal-input { width: 100%; padding: 13px 14px; border: 2px solid var(--border); border-radius: 12px; font-size: 15px; background: var(--surface); color: var(--text); outline: none; margin-bottom: 12px; transition: border-color .2s; font-family: inherit; }
  .modal-input:focus { border-color: var(--primary); }
  .modal-select { width: 100%; padding: 13px 14px; border: 2px solid var(--border); border-radius: 12px; font-size: 15px; background: var(--surface); color: var(--text); outline: none; margin-bottom: 12px; cursor: pointer; font-family: inherit; }
  .qty-row { display: flex; align-items: center; justify-content: center; gap: 22px; margin: 14px 0 22px; }
  .qty-btn { width: 48px; height: 48px; border-radius: 14px; border: 2px solid var(--border); background: var(--surface); font-size: 24px; font-weight: 800; cursor: pointer; transition: all .2s; color: var(--text); }
  .qty-btn:hover { border-color: var(--primary); background: rgba(255,217,61,0.1); }
  .qty-val { font-size: 32px; font-weight: 800; min-width: 60px; text-align: center; padding: 0 14px; outline: none; border: 2px solid transparent; border-radius: 8px; background: transparent; color: var(--text); }
  .qty-val:focus { border-color: var(--primary); }
  .modal-save { width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #000; font-weight: 800; font-size: 15px; cursor: pointer; box-shadow: 0 4px 12px rgba(255,193,7,0.3); transition: all .2s; }
  .modal-save:hover { transform: translateY(-1px); }
  .modal-cancel { width: 100%; padding: 12px; border-radius: 12px; border: none; background: transparent; color: var(--text-2); font-weight: 700; font-size: 14px; cursor: pointer; margin-top: 6px; }
  .modal-cancel:hover { color: var(--text); }
  .modal-close-btn { width: 100%; padding: 12px; text-align: center; color: var(--red); font-size: 15px; font-weight: 800; background: none; border: none; cursor: pointer; margin-top: 8px; transition: opacity .2s; }
  .modal-close-btn:hover { opacity: 0.7; }

  /* CONFIRM DIALOG */
  .confirm-box { background: var(--surface); border-radius: var(--radius); padding: 24px; max-width: 340px; width: 100%; box-shadow: var(--shadow-lg); }
  .confirm-title { font-size: 17px; font-weight: 800; margin-bottom: 8px; color: var(--text); }
  .confirm-msg { font-size: 14px; color: var(--text-2); margin-bottom: 20px; font-weight: 500; line-height: 1.5; }
  .confirm-btns { display: flex; gap: 10px; }
  .confirm-btn { flex: 1; padding: 13px; border-radius: 12px; border: none; font-size: 14px; font-weight: 800; cursor: pointer; transition: all .2s; }
  .confirm-cancel { background: var(--surface-2); color: var(--text); border: 2px solid var(--border); }
  .confirm-cancel:hover { border-color: var(--primary); }
  .confirm-delete { background: linear-gradient(135deg, #F87171, #EF4444); color: #fff; box-shadow: 0 2px 8px rgba(239,68,68,0.3); }
  .confirm-delete:hover { transform: translateY(-1px); }

  /* ADMIN — hierarchy */
  .admin-card { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; margin: 0 20px 10px; flex-wrap: wrap; }
  .admin-uname { font-size: 15px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 6px; }
  .admin-uname .lock { font-size: 13px; color: var(--orange); }
  .admin-role { font-size: 11px; font-weight: 800; color: var(--primary-deep); background: rgba(255,217,61,0.22); padding: 4px 10px; border-radius: 8px; display: inline-block; margin-top: 5px; border: 1px solid rgba(255,193,7,0.3); }
  .admin-actions { display: flex; align-items: center; gap: 8px; }
  .admin-edit { background: linear-gradient(135deg,#4ADE80,#22C55E); color: #fff; border: none; border-radius: 10px; padding: 8px 12px; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(34,197,94,0.3); transition: all .2s; }
  .admin-edit:hover { transform: translateY(-1px); }
  .admin-edit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
  .admin-toggle { display: flex; align-items: center; gap: 6px; }
  .admin-toggle .label { font-size: 11px; font-weight: 700; color: var(--text-2); text-transform: uppercase; letter-spacing: 0.4px; }
  .role-option { width: 100%; padding: 13px; border-radius: 11px; background: var(--surface-2); border: 2px solid var(--border); margin-bottom: 8px; text-align: center; font-size: 14px; font-weight: 700; color: var(--text); cursor: pointer; transition: all .2s; }
  .role-option:hover { border-color: var(--primary); }
  .role-option.selected { background: linear-gradient(135deg, var(--primary-dark), var(--primary)); color: #000; font-weight: 800; border-color: var(--primary); }

  /* SCANNING OVERLAY */
  .scanning-overlay { position: fixed; inset: 0; background: rgba(255,255,255,0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 300; gap: 18px; backdrop-filter: blur(8px); }
  [data-dark="true"] .scanning-overlay { background: rgba(0,0,0,0.95); }
  .spinner { width: 44px; height: 44px; border: 4px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: bxSpin 0.7s linear infinite; }
  @keyframes bxSpin { to { transform: rotate(360deg); } }
  .scanning-text { font-size: 15px; font-weight: 700; color: var(--primary-deep); }

  /* TOAST */
  .toast { position: fixed; bottom: calc(var(--tab-height) + 20px); left: 50%; transform: translateX(-50%); background: #1C1C1E; color: #fff; padding: 13px 22px; border-radius: 22px; font-size: 14px; font-weight: 700; z-index: 500; white-space: nowrap; max-width: 90vw; overflow: hidden; text-overflow: ellipsis; animation: bxToast .3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  [data-dark="true"] .toast { background: var(--surface-2); color: var(--text); }
  @media (min-width: 1024px) { .toast { bottom: 28px; } }
  @keyframes bxToast { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

  @keyframes bxFadeIn { from { opacity: 0; } to { opacity: 1; } }

  /* VERSION TEXT */
  .version-text { text-align: center; color: var(--muted); font-size: 12px; padding: 24px 20px 36px; font-weight: 600; }
`;