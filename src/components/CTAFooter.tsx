import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail } from 'lucide-react';

const Logo = ({ light = false }: { light?: boolean }) => (
  <div className="flex items-center gap-3">
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="24" fill="#064e3b"/>
      <path d="M30 50C30 38.9543 38.9543 30 50 30C61.0457 30 70 38.9543 70 50"
        stroke="white" strokeWidth="10" strokeLinecap="round"/>
      <circle cx="50" cy="50" r="10" fill="#10b981"/>
      <path d="M50 50L70 70" stroke="white" strokeWidth="10" strokeLinecap="round"/>
    </svg>
    <span
      className="text-xl font-bold tracking-tight"
      style={{ fontFamily: "'Poppins', sans-serif", color: 'white' }}
    >
      Composte
    </span>
  </div>
);

const CTAFooter = () => {
  return (
    <footer
      style={{
        background: '#022c22',
        color: '#a8a29e',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Section CTA */}
      <div
        className="py-32 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #064e3b 0%, #022c22 100%)' }}
      >
        {/* Orbe décoratif */}
        <div
          className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.03)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2
            className="mb-12"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: 'white',
            }}
          >
            Récoltons ensemble{' '}
            <br />
            <span style={{ color: '#a38a5e', fontStyle: 'italic' }}>
              le futur du Congo.
            </span>
          </h2>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/market">
              <button
                className="btn-argile"
                style={{ padding: '1.2rem 3rem', fontSize: '0.72rem' }}
              >
                Accéder au Marché
              </button>
            </Link>
            <Link to="/dashboard">
              <button
                className="btn-outline-white"
                style={{ padding: '1.2rem 3rem', fontSize: '0.72rem' }}
              >
                Mon Tableau de Bord
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer links */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-10">
            <Logo />
            <p
              className="max-w-xs leading-relaxed text-lg font-medium"
              style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}
            >
              Connecter la terre congolaise aux marchés urbains pour un développement
              durable et équitable.
            </p>

            <div className="space-y-6">
              {/* Fondateur */}
              <div className="flex items-center gap-5 group">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#a38a5e',
                  }}
                >
                  <User size={20} />
                </div>
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    Co-Fondateur
                  </p>
                  <p className="font-bold text-white">Felici PFOUAPO ELENGA</p>
                </div>
              </div>

              {/* Email */}
              <a href="mailto:mrpfouapo@gmail.com" className="flex items-center gap-5 group">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#a38a5e',
                  }}
                >
                  <Mail size={20} />
                </div>
                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1"
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  >
                    Support Email
                  </p>
                  <p
                    className="font-bold transition"
                    style={{ color: 'white' }}
                  >
                    mrpfouapo@gmail.com
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Plateforme */}
          <div className="space-y-10">
            <h4
              className="font-bold text-[11px] uppercase tracking-[0.4em]"
              style={{ color: 'white' }}
            >
              Plateforme
            </h4>
            <ul className="space-y-5">
              {[
                { to: '/market', label: 'Marché Direct' },
                { to: '/recommendations', label: 'Cultures IA' },
                { to: '/weather', label: 'Météo Agricole' },
                { to: '/disease-scanner', label: 'Scanner Maladies' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="font-bold text-[12px] uppercase tracking-widest transition"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#a38a5e')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Société */}
          <div className="space-y-10">
            <h4
              className="font-bold text-[11px] uppercase tracking-[0.4em]"
              style={{ color: 'white' }}
            >
              Société
            </h4>
            <ul className="space-y-5">
              {[
                { to: '/dashboard', label: 'Mon Espace' },
                { to: '/profile', label: 'Mon Profil' },
                { to: '/ai-assistant', label: 'Assistant IA' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="font-bold text-[12px] uppercase tracking-widest transition"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#a38a5e')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="mt-20 pt-10 text-center text-[11px] font-bold uppercase tracking-widest"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.2)' }}
        >
          © {new Date().getFullYear()} Composte AI · Agriculture Intelligente · Congo Brazzaville
        </div>
      </div>
    </footer>
  );
};

export default CTAFooter;
