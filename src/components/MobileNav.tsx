/**
 * MobileNav.tsx
 * Barre de navigation bottom — style app native (iOS/Android)
 * Remplace la Navbar desktop sur mobile
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, Microscope,
  CloudSun, ShoppingCart, User, Leaf, Bot
} from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

const TAB_ITEMS = [
  { path: '/dashboard',       icon: Home,         label: 'Accueil'   },
  { path: '/disease-scanner', icon: Microscope,   label: 'Scanner'   },
  { path: '/weather',         icon: CloudSun,     label: 'Météo'     },
  { path: '/market',          icon: ShoppingCart, label: 'Marché'    },
  { path: '/profile',         icon: User,         label: 'Profil'    },
];

// Bouton central (action principale)
const FAB_PATH = '/disease-scanner';

export default function MobileNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  // Pages où la nav est cachée
  const HIDDEN_ON = ['/auth', '/'];
  if (HIDDEN_ON.includes(location.pathname)) return null;

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché derrière la nav */}
      <div style={{ height: '72px' }} />

      {/* Barre de navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(6,78,59,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 24px rgba(6,78,59,0.08)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0.5rem 0.5rem 0.25rem',
          maxWidth: '480px',
          margin: '0 auto',
        }}>
          {TAB_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                style={{ textDecoration: 'none', flex: 1 }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: '0.4rem 0.25rem',
                  borderRadius: '1rem',
                  transition: 'all 0.15s',
                  background: active ? 'rgba(6,78,59,0.07)' : 'transparent',
                }}>
                  <div style={{ position: 'relative' }}>
                    <Icon
                      size={22}
                      style={{
                        color: active ? '#064e3b' : '#9ca3af',
                        transition: 'color 0.15s',
                        strokeWidth: active ? 2.5 : 1.8,
                      }}
                    />
                    {/* Indicateur actif */}
                    {active && (
                      <div style={{
                        position: 'absolute',
                        top: '-3px', right: '-3px',
                        width: '6px', height: '6px',
                        borderRadius: '50%',
                        background: '#10b981',
                      }} />
                    )}
                  </div>
                  <span style={{
                    fontFamily: F,
                    fontSize: '0.58rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#064e3b' : '#9ca3af',
                    letterSpacing: '0.02em',
                    lineHeight: 1,
                  }}>
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
