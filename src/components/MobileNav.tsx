/**
 * MobileNav.tsx — Style app native, inspiré Composte Agri Flutter
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Clock, User } from 'lucide-react';

const F = "'DM Sans', 'Poppins', sans-serif";

const TABS = [
  { path: '/dashboard',  icon: Home,        label: 'Accueil'    },
  { path: '/market',     icon: ShoppingBag, label: 'Marché'     },
  { path: '/weather',    icon: Clock,       label: 'Activités'  },
  { path: '/profile',    icon: User,        label: 'Compte'     },
];

// Icône feuille SVG pour "Marché" (comme dans l'app Flutter)
const LeafIcon = ({ size = 22, color = '#666' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3c2.2 0 4.2.9 5.7 2.3L7.3 17.7C5.9 16.2 5 14.2 5 12c0-3.9 3.1-7 7-7zm0 14c-2.2 0-4.2-.9-5.7-2.3l10.4-10.4C18.1 7.8 19 9.8 19 12c0 3.9-3.1 7-7 7z" fill={color}/>
  </svg>
);

export default function MobileNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path ||
    (path === '/dashboard' && location.pathname === '/');

  const HIDDEN_ON = ['/auth'];
  if (HIDDEN_ON.includes(location.pathname)) return null;

  return (
    <>
      <div style={{ height: '64px' }} />
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: '#fff',
        borderTop: '1px solid #E8E8E8',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          maxWidth: '480px', margin: '0 auto',
        }}>
          {TABS.map(({ path, icon: Icon, label }, i) => {
            const active = isActive(path);
            // Icône feuille spéciale pour Marché
            const isMarche = label === 'Marché';
            return (
              <Link key={path} to={path} style={{ flex: 1, textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '10px 4px 8px',
                  gap: '3px',
                }}>
                  {isMarche ? (
                    <LeafIcon size={23} color={active ? '#1B5E3B' : '#9E9E9E'} />
                  ) : (
                    <Icon size={23} color={active ? '#1B5E3B' : '#9E9E9E'}
                      strokeWidth={active ? 2.5 : 1.8} />
                  )}
                  <span style={{
                    fontFamily: F,
                    fontSize: '11px',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#1B5E3B' : '#9E9E9E',
                    letterSpacing: '0.01em',
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
