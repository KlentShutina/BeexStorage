import { useEffect, useState } from "react";
import logo from "./assets/logo.png";

// Loading screen — hexagon-shaped progressive reveal matching the BeexStorage logo.
// Yellow gradient backdrop with a centered logo, pulsing shadow, and a slim progress bar.
export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(i); onDone && setTimeout(onDone, 250); return 100; }
        return p + 2;
      });
    }, 30);
    return () => clearInterval(i);
  }, [onDone]);

  return (
    <div className="bx-loading">
      <style>{css}</style>
      <div className="bx-loading-inner">
        <div className="bx-logo-wrap">
          <div className="bx-logo-glow" />
          <img src={logo} alt="BeexStorage" className="bx-logo-img" />
        </div>
        <h1 className="bx-loading-title">beex<span>storage</span></h1>
        <p className="bx-loading-sub">Storage Management System</p>
        <div className="bx-progress-wrap">
          <div className="bx-progress-bar">
            <div className="bx-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="bx-progress-text">{progress}%</div>
        </div>
      </div>
    </div>
  );
}

const css = `
  .bx-loading {
    position: fixed; inset: 0; z-index: 9999;
    background: linear-gradient(135deg, #FFD93D 0%, #FFC107 60%, #FFB300 100%);
    display: flex; align-items: center; justify-content: center;
    animation: bxFadeIn .35s ease;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  @keyframes bxFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .bx-loading-inner { display: flex; flex-direction: column; align-items: center; gap: 26px; padding: 24px; }
  .bx-logo-wrap { position: relative; width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; animation: bxFloat 3s ease-in-out infinite; }
  @keyframes bxFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  .bx-logo-glow { position: absolute; inset: 0; border-radius: 32px; background: rgba(0,0,0,0.18); filter: blur(20px); animation: bxPulse 2s ease-in-out infinite; }
  @keyframes bxPulse { 0%,100% { transform: scale(0.9); opacity: 0.5; } 50% { transform: scale(1.05); opacity: 0.85; } }
  .bx-logo-img { width: 140px; height: 140px; border-radius: 30px; object-fit: cover; box-shadow: 0 14px 30px rgba(0,0,0,0.18); position: relative; z-index: 1; }
  .bx-loading-title { font-size: 36px; font-weight: 800; color: #1C1C1E; margin: 0; letter-spacing: -0.5px; animation: bxSlideUp .6s ease .25s both; }
  .bx-loading-title span { color: #fff; font-weight: 700; }
  @keyframes bxSlideUp { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .bx-loading-sub { font-size: 14px; font-weight: 600; color: #2C2C2E; margin: -16px 0 0; opacity: 0; animation: bxFadeText .6s ease .45s forwards; }
  @keyframes bxFadeText { to { opacity: 0.85; } }
  .bx-progress-wrap { width: 220px; display: flex; flex-direction: column; gap: 8px; opacity: 0; animation: bxFadeText .6s ease .65s forwards; }
  .bx-progress-bar { width: 100%; height: 6px; background: rgba(28,28,30,0.18); border-radius: 6px; overflow: hidden; }
  .bx-progress-fill { height: 100%; background: #1C1C1E; border-radius: 6px; transition: width .25s ease; }
  .bx-progress-text { text-align: center; font-size: 11px; font-weight: 800; color: #1C1C1E; opacity: 0.6; letter-spacing: 1px; }
`;
