import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingCart, Menu, X } from 'lucide-react';

const Logo = ({ light = false }: { light?: boolean }) => (
  <div className="flex items-center gap-3">
    <img
      src="/composte-logo.jpg"
      alt="Composte AI"
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        objectFit: 'cover',
        border: light ? '2px solid rgba(255,255,255,0.2)' : '2px solid rgba(6,78,59,0.1)',
      }}
    />
    <span
      className="text-2xl font-bold tracking-tight"
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 900,
        letterSpacing: '-0.02em',
        color: light ? 'white' : '#064e3b'
      }}
    >
      Composte
    </span>
  </div>
);

const navLinks = [
  { path: '/',                label: 'Accueil' },
  { path: '/dashboard',       label: 'Dashboard' },
  { path: '/soil-analysis',   label: 'Sol' },
  { path: '/disease-scanner', label: 'Maladies' },
  { path: '/ai-assistant',    label: 'IA' },
  { path: '/weather',         label: 'Météo' },
  { path: '/market',          label: 'Marché' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{ padding: scrolled ? '0.75rem 0' : '1.5rem 0' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between h-16 px-8 rounded-full transition-all duration-500 ${
            scrolled
              ? 'glass shadow-lg'
              : isHome
              ? 'bg-transparent'
              : 'glass shadow-md'
          }`}
        >
          {/* Logo */}
          <Link to="/">
            <Logo light={!scrolled && isHome} />
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden lg:flex items-center gap-5">
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className="relative text-[11px] font-bold uppercase tracking-[0.25em] transition-colors"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: isActive(path)
                    ? (!scrolled && isHome ? 'white' : '#10b981')
                    : (!scrolled && isHome ? 'rgba(255,255,255,0.65)' : '#9ca3af'),
                }}
              >
                {label}
                {isActive(path) && (
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: !scrolled && isHome ? 'white' : '#10b981' }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA + user */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="hidden sm:block text-[10px] font-bold uppercase tracking-widest transition-colors"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: !scrolled && isHome ? 'rgba(255,255,255,0.7)' : '#6b7280',
                  }}
                >
                  {user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-argile hidden sm:block"
                  style={{ padding: '0.6rem 1.4rem', fontSize: '0.65rem' }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link to="/auth">
                <button
                  className="btn-argile"
                  style={{ padding: '0.6rem 1.6rem', fontSize: '0.65rem' }}
                >
                  Connexion
                </button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-full transition"
              style={{ color: !scrolled && isHome ? 'white' : '#064e3b' }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="lg:hidden mt-3 rounded-3xl p-6 shadow-xl"
            style={{ background: '#f9f6f0', border: '1px solid rgba(163,138,94,0.15)' }}
          >
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-[11px] font-bold uppercase tracking-[0.25em] border-b last:border-0"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  color: isActive(path) ? '#064e3b' : '#9ca3af',
                  borderColor: 'rgba(163,138,94,0.1)',
                }}
              >
                {label}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <button className="btn-argile w-full mt-4" style={{ fontSize: '0.65rem' }}>
                  Connexion
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
