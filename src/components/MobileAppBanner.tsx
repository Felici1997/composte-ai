/**
 * MobileAppBanner.tsx
 * Bandeau d'installation PWA + indicateur hors-ligne
 */
import React, { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Download, WifiOff, X, Smartphone } from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

export default function MobileAppBanner() {
  const { installPrompt, isInstalled, isOnline, install } = usePWA();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa-banner-dismissed') === 'true'
  );

  const dismiss = () => {
    localStorage.setItem('pwa-banner-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <>
      {/* ─── Bandeau hors-ligne ─── */}
      {!isOnline && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#1e293b', padding: '0.6rem 1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          fontFamily: F, fontSize: '0.75rem', color: 'white',
        }}>
          <WifiOff size={14} style={{ color: '#f59e0b' }} />
          <span>Mode hors-ligne — Certaines fonctionnalités sont limitées</span>
        </div>
      )}

      {/* ─── Bandeau installation Android/Desktop ─── */}
      {installPrompt && !isInstalled && !dismissed && (
        <div style={{
          position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 9998,
          background: 'linear-gradient(135deg, #022c22, #064e3b)',
          borderRadius: '1.5rem', padding: '1.2rem 1.5rem',
          boxShadow: '0 8px 40px rgba(2,44,34,0.4)',
          border: '1px solid rgba(16,185,129,0.2)',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Smartphone size={22} style={{ color: '#10b981' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FH, fontWeight: 800, color: 'white', fontSize: '0.9rem', marginBottom: '0.15rem' }}>
              Installer Composte AI
            </div>
            <div style={{ fontFamily: F, fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
              Accédez à l'app directement depuis votre écran d'accueil, même hors-ligne.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button onClick={install}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1.1rem', borderRadius: '2rem', background: '#10b981', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: 'white' }}>
              <Download size={13} /> Installer
            </button>
            <button onClick={dismiss}
              style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─── Guide iOS (pas de beforeinstallprompt) ─── */}
      {!installPrompt && !isInstalled && !dismissed && /iphone|ipad|ipod/i.test(navigator.userAgent) && (
        <div style={{
          position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem', zIndex: 9998,
          background: 'linear-gradient(135deg,#022c22,#064e3b)',
          borderRadius: '1.5rem', padding: '1.2rem 1.5rem',
          boxShadow: '0 8px 40px rgba(2,44,34,0.4)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
            <div style={{ fontFamily: FH, fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>
              Installer sur iPhone / iPad
            </div>
            <button onClick={dismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0 }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { n: '1', t: 'Appuyez sur le bouton Partager', icon: '⬆️' },
              { n: '2', t: 'Sélectionnez "Sur l\'écran d\'accueil"', icon: '📲' },
              { n: '3', t: 'Appuyez sur "Ajouter"', icon: '✅' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                <span style={{ fontSize: '1rem' }}>{s.icon}</span>
                <span style={{ fontFamily: F, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>{s.t}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
