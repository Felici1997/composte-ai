/**
 * MobileHeader.tsx — Style app native Composte
 * Logo gauche + panier/notif droite sur accueil
 * Retour + titre centré + label droite sur sous-pages
 */
import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag } from 'lucide-react';

const F  = "'DM Sans', 'Poppins', sans-serif";
const FH = "'DM Sans', 'Outfit', sans-serif";

// Logo SVG Composte compact
const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: '#1B5E3B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C8.5 3 5.5 5.5 5 9c-.5 3.5 1.5 6.5 4.5 7.8V20h5v-3.2C17 15.5 19 12.5 18.5 9 18 5.5 15.5 3 12 3z" fill="white" opacity="0.9"/>
        <path d="M12 3v10M9 8l3-5 3 5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <span style={{
      fontFamily: FH, fontWeight: 700, fontSize: '17px',
      color: '#1a1a1a', letterSpacing: '0.5px',
    }}>
      COMPOSTE
    </span>
  </div>
);

// Badge panier
const CartBadge = ({ count = 0 }: { count?: number }) => (
  <div style={{ position: 'relative' }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: '#1B5E3B',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <ShoppingBag size={20} color="white" />
    </div>
    {count >= 0 && (
      <div style={{
        position: 'absolute', top: -4, right: -4,
        width: 20, height: 20, borderRadius: '50%',
        background: '#E53935', color: 'white',
        fontFamily: F, fontWeight: 700, fontSize: '11px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {count}
      </div>
    )}
  </div>
);

const SUB_PAGES: Record<string, string> = {
  '/soil-analysis':   'Analyse Sol',
  '/disease-scanner': 'Scanner',
  '/recommendations': 'Conseils',
  '/ai-assistant':    'Assistant IA',
  '/profile':         'Compte',
  '/weather':         'Météo',
  '/market':          'Marché',
};

// Pages qui affichent le logo (accueil)
const LOGO_PAGES = ['/', '/dashboard'];

export default function MobileHeader() {
  const location = useLocation();
  const navigate  = useNavigate();
  const path      = location.pathname;

  if (path === '/auth') return null;

  const isHome   = LOGO_PAGES.includes(path);
  const subTitle = SUB_PAGES[path];

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 500,
      background: '#fff',
      borderBottom: isHome ? 'none' : '1px solid #F0F0F0',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: isHome ? '14px 16px 10px' : '10px 16px',
        maxWidth: '480px', margin: '0 auto',
        minHeight: 56,
      }}>

        {isHome ? (
          // ACCUEIL : logo + panier
          <>
            <Logo />
            <CartBadge count={0} />
          </>
        ) : (
          // SOUS-PAGE : retour + titre centré + label droit
          <>
            <button onClick={() => navigate(-1)} style={{
              width: 38, height: 38, borderRadius: '50%',
              background: '#1B5E3B', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ChevronLeft size={20} color="white" strokeWidth={2.5} />
            </button>

            <div style={{ flex: 1 }} />

            {subTitle && (
              <div style={{
                padding: '6px 14px', borderRadius: 20,
                background: '#E8F5EE',
                fontFamily: F, fontWeight: 600, fontSize: '13px',
                color: '#1B5E3B',
              }}>
                {subTitle}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
