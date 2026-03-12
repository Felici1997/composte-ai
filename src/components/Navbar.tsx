import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useLanguage } from '@/contexts/LanguageContext';
import { CompactLanguageToggle } from '@/components/LanguageToggle';

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { href: '/', label: t('nav.home'), icon: '🏠' },
    { href: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { href: '/soil-analysis', label: t('nav.soil'), icon: '🌱' },
    { href: '/disease-scanner', label: t('nav.disease'), icon: '🔍' },
    { href: '/ai-assistant', label: t('nav.ai'), icon: '🤖' },
    { href: '/weather-analytics', label: t('nav.weather'), icon: '🌤️' },
    { href: '/market', label: t('nav.market'), icon: '📈' },
  ];

  return (
    <nav className="bg-card border-b border-earth sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src="/composte-logo.jpg" alt="Composte AI" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold text-foreground">Composte AI</span>
              <span className="text-xs text-muted-foreground">Agriculture Intelligente</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  location.pathname === link.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-earth/20'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            <CompactLanguageToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <span>👤</span>
                    <span>{t('nav.profile')}</span>
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  {t('nav.signout')}
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-cta hover:bg-cta/90">
                  {t('nav.getStarted')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-earth/20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-earth">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${
                    location.pathname === link.href
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-earth/20'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-earth mt-4 space-y-3">
                <div className="flex justify-center">
                  <CompactLanguageToggle />
                </div>
                {user ? (
                  <div className="space-y-2">
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        <span className="mr-3">👤</span>
                        {t('nav.profile')}
                      </Button>
                    </Link>
                    <Button onClick={handleSignOut} variant="outline" className="w-full">
                      {t('nav.signout')}
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-cta hover:bg-cta/90">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
