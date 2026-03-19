/**
 * MobileHeader.tsx
 * En-tête compact pour toutes les pages en mode mobile
 * Remplace les gros headers desktop
 */
import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

const PAGE_TITLES: Record<string, { title: string; subtitle?: string; back?: boolean }> = {
  '/dashboard':       { title: 'Bonjour 👋',        subtitle: 'Composte AI' },
  '/disease-scanner': { title: 'Scanner',             subtitle: 'Diagnostic maladie', back: false },
  '/weather':         { title: 'Météo',               subtitle: 'Conditions agricoles', back: false },
  '/market':          { title: 'Marché',              subtitle: 'Prix des cultures', back: false },
  '/profile':         { title: 'Mon profil',          back: true },
  '/soil-analysis':   { title: 'Analyse de sol',      back: true },
  '/recommendations': { title: 'Recommandations',     back: true },
  '/ai-assistant':    { title: 'Assistant IA',         back: true },
};

interface Props {
  userName?: string;
}

export default function MobileHeader({ userName }: Props) {
  const location = useLocation();
  const navigate  = useNavigate();
  const config    = PAGE_TITLES[location.pathname];

  if (!config) return null;

  const title = config.title === 'Bonjour 👋' && userName
    ? `Bonjour, ${userName.split(' ')[0]} 👋`
    : config.title;

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(6,78,59,0.07)',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.2rem',
        maxWidth: '480px',
        margin: '0 auto',
      }}>
        {/* Gauche : retour ou logo */}
        <div style={{ width: '36px' }}>
          {config.back ? (
            <button
              onClick={() => navigate(-1)}
              style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: '#f9f6f0',
                border: '1px solid rgba(6,78,59,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={18} style={{ color: '#064e3b' }} />
            </button>
          ) : (
            <Link to="/dashboard">
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '10px',
                background: '#064e3b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
              }}>
                🌿
              </div>
            </Link>
          )}
        </div>

        {/* Centre : titre */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{
            fontFamily: FH,
            fontWeight: 800,
            fontSize: '1rem',
            color: '#064e3b',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
            {title}
          </div>
          {config.subtitle && (
            <div style={{
              fontFamily: F,
              fontSize: '0.65rem',
              color: '#9ca3af',
              marginTop: '0.05rem',
            }}>
              {config.subtitle}
            </div>
          )}
        </div>

        {/* Droite : actions */}
        <div style={{ width: '36px', display: 'flex', justifyContent: 'flex-end' }}>
          <button style={{
            width: '36px', height: '36px',
            borderRadius: '50%',
            background: '#f9f6f0',
            border: '1px solid rgba(6,78,59,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}>
            <Bell size={16} style={{ color: '#064e3b' }} />
            {/* Badge notification */}
            <div style={{
              position: 'absolute', top: '6px', right: '6px',
              width: '7px', height: '7px',
              borderRadius: '50%', background: '#ef4444',
              border: '1.5px solid white',
            }} />
          </button>
        </div>
      </div>
    </div>
  );
}
