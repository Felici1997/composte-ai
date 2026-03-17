/**
 * AIProviderSelector.tsx
 * Sélecteur de provider IA — OpenAI · Gemini · Anthropic
 * À placer dans les pages qui utilisent l'IA
 */
import React, { useState, useEffect } from 'react';
import {
  getAvailableProviders,
  getActiveProvider,
  setActiveProvider,
  type AIProvider,
} from '@/services/aiProvider';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

const PROVIDER_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  openai:    { icon: '🤖', color: '#10a37f', bg: '#f0fdf8', border: '#a7f3d0' },
  gemini:    { icon: '✨', color: '#4285f4', bg: '#eff6ff', border: '#bfdbfe' },
  anthropic: { icon: '🔶', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  fallback:  { icon: '📋', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

interface Props {
  compact?: boolean; // true = icône seule, false = label complet
  onChange?: (provider: AIProvider) => void;
}

export default function AIProviderSelector({ compact = false, onChange }: Props) {
  const [active, setActive]       = useState<AIProvider>(getActiveProvider());
  const [showMenu, setShowMenu]   = useState(false);
  const providers                 = getAvailableProviders();
  const hasAny                    = providers.some(p => p.available);

  useEffect(() => {
    setActive(getActiveProvider());
  }, []);

  const select = (p: AIProvider) => {
    setActiveProvider(p);
    setActive(p);
    setShowMenu(false);
    onChange?.(p);
  };

  const meta    = PROVIDER_META[active] ?? PROVIDER_META.fallback;
  const isDemo  = active === 'fallback' || !hasAny;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bouton principal */}
      <button
        onClick={() => setShowMenu(s => !s)}
        title="Changer de provider IA"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: compact ? '0.35rem 0.75rem' : '0.45rem 1rem',
          borderRadius: '2rem',
          background: isDemo ? '#f9fafb' : meta.bg,
          border: `1.5px solid ${isDemo ? '#e5e7eb' : meta.border}`,
          cursor: 'pointer', transition: 'all 0.15s',
          fontFamily: F, fontSize: '0.7rem', fontWeight: 700,
          color: isDemo ? '#6b7280' : meta.color,
          whiteSpace: 'nowrap',
        }}
      >
        <span>{isDemo ? '📋' : meta.icon}</span>
        {!compact && (
          <span>
            {isDemo ? 'Mode démo' : providers.find(p => p.provider === active)?.label ?? active}
          </span>
        )}
        <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>▼</span>
      </button>

      {/* Menu déroulant */}
      {showMenu && (
        <>
          {/* Overlay fermeture */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
            onClick={() => setShowMenu(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1000,
            background: 'white', borderRadius: '1.2rem', padding: '0.75rem',
            border: '1px solid rgba(6,78,59,0.1)',
            boxShadow: '0 8px 32px rgba(6,78,59,0.12)',
            minWidth: '220px',
          }}>
            <div style={{ fontFamily: F, fontSize: '0.62rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem', paddingLeft: '0.4rem' }}>
              Provider IA
            </div>

            {providers.map(p => {
              const pm = PROVIDER_META[p.provider];
              const isActive = active === p.provider;
              return (
                <button
                  key={p.provider}
                  onClick={() => p.available ? select(p.provider) : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', borderRadius: '0.8rem', border: 'none',
                    textAlign: 'left', cursor: p.available ? 'pointer' : 'not-allowed',
                    background: isActive ? pm.bg : 'transparent',
                    marginBottom: '0.2rem', transition: 'background 0.15s',
                    opacity: p.available ? 1 : 0.4,
                  }}
                  onMouseEnter={e => { if (p.available && !isActive) e.currentTarget.style.background = '#f9f6f0'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '0.6rem', flexShrink: 0,
                    background: pm.bg, border: `1.5px solid ${pm.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  }}>
                    {pm.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.82rem', color: p.available ? '#064e3b' : '#9ca3af' }}>
                      {p.label}
                    </div>
                    <div style={{ fontFamily: F, fontSize: '0.62rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                      {p.available ? `Modèle : ${p.model}` : `Configurez ${p.keyVar}`}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pm.color, flexShrink: 0 }} />
                  )}
                  {!p.available && (
                    <span style={{ fontFamily: F, fontSize: '0.58rem', color: '#d1d5db', fontWeight: 700 }}>N/A</span>
                  )}
                </button>
              );
            })}

            {/* Séparateur */}
            <div style={{ height: '1px', background: 'rgba(6,78,59,0.07)', margin: '0.5rem 0' }} />

            {/* Mode démo */}
            <button
              onClick={() => select('fallback')}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem', borderRadius: '0.8rem', border: 'none',
                textAlign: 'left', cursor: 'pointer',
                background: active === 'fallback' ? '#f9fafb' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (active !== 'fallback') e.currentTarget.style.background = '#f9f6f0'; }}
              onMouseLeave={e => { if (active !== 'fallback') e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '0.6rem', flexShrink: 0, background: '#f9fafb', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                📋
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.82rem', color: '#6b7280' }}>Mode démo</div>
                <div style={{ fontFamily: F, fontSize: '0.62rem', color: '#9ca3af', marginTop: '0.1rem' }}>Planning générique, sans clé API</div>
              </div>
              {active === 'fallback' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6b7280' }} />}
            </button>

            {/* Lien config */}
            {!hasAny && (
              <div style={{ marginTop: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: '0.8rem', background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#92400e', lineHeight: 1.5 }}>
                  💡 Ajoutez <code style={{ background: '#fef3c7', padding: '0 3px', borderRadius: '3px' }}>VITE_OPENAI_API_KEY</code>, <code style={{ background: '#fef3c7', padding: '0 3px', borderRadius: '3px' }}>VITE_GEMINI_API_KEY</code> ou <code style={{ background: '#fef3c7', padding: '0 3px', borderRadius: '3px' }}>VITE_ANTHROPIC_API_KEY</code> dans vos variables Vercel.
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
