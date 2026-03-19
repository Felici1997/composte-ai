/**
 * MobileHome.tsx
 * Page d'accueil mobile — style app native
 * Tableau de bord personnalisé avec accès rapide aux fonctionnalités
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLocationContext } from '@/contexts/LocationContext';
import {
  Microscope, CloudSun, ShoppingCart, Leaf,
  Bot, ChevronRight, MapPin, TrendingUp,
  Droplets, Wind, Zap, Bell, Calendar,
  ArrowUpRight, Sprout
} from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'bdc7bc29f0d1be26b9ba457903ad9ec5';

/* ─── ACTIONS RAPIDES ─── */
const QUICK_ACTIONS = [
  {
    path: '/disease-scanner',
    icon: <Microscope size={26} />,
    label: 'Scanner',
    desc: 'Détecter une maladie',
    color: '#064e3b',
    bg: 'linear-gradient(135deg, #064e3b, #0a6644)',
    light: '#e8f5f0',
  },
  {
    path: '/weather',
    icon: <CloudSun size={26} />,
    label: 'Météo',
    desc: 'Prévisions agricoles',
    color: '#1d4ed8',
    bg: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
    light: '#eff6ff',
  },
  {
    path: '/soil-analysis',
    icon: <Leaf size={26} />,
    label: 'Sol',
    desc: 'Analyser votre sol',
    color: '#a38a5e',
    bg: 'linear-gradient(135deg, #a38a5e, #8b7355)',
    light: '#fdf8f0',
  },
  {
    path: '/market',
    icon: <ShoppingCart size={26} />,
    label: 'Marché',
    desc: 'Prix des cultures',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    light: '#f5f3ff',
  },
  {
    path: '/recommendations',
    icon: <Sprout size={26} />,
    label: 'Conseils',
    desc: 'Recommandations IA',
    color: '#059669',
    bg: 'linear-gradient(135deg, #059669, #047857)',
    light: '#ecfdf5',
  },
  {
    path: '/ai-assistant',
    icon: <Bot size={26} />,
    label: 'Assistant',
    desc: 'Poser une question',
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    light: '#fef2f2',
  },
];

const MARKET_PRICES = [
  { name: 'Manioc',  price: '850',  unit: 'FCFA/kg', trend: '+3%',  up: true  },
  { name: 'Maïs',   price: '1 200', unit: 'FCFA/kg', trend: '-2%',  up: false },
  { name: 'Tomate', price: '2 500', unit: 'FCFA/kg', trend: '+8%',  up: true  },
  { name: 'Arachide',price: '1 800',unit: 'FCFA/kg', trend: '+1%',  up: true  },
];

export default function MobileHome() {
  const { selectedLocationName, selectedCoordinates, hasLocation } = useLocationContext();
  const [user, setUser]       = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [stats, setStats]     = useState({ scans: 0, recs: 0 });
  const [greeting, setGreeting] = useState('Bonjour');
  const now = new Date();

  useEffect(() => {
    const h = now.getHours();
    setGreeting(h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setUser(session.user);
      // Charger stats
      Promise.all([
        supabase.from('disease_detections').select('id', { count: 'exact' }).eq('user_id', session.user.id),
        supabase.from('crop_recommendations').select('id', { count: 'exact' }).eq('user_id', session.user.id),
      ]).then(([d, r]) => setStats({ scans: d.count || 0, recs: r.count || 0 }));
    });
  }, []);

  useEffect(() => {
    if (!selectedCoordinates) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${selectedCoordinates.lat}&lon=${selectedCoordinates.lon}&appid=${API_KEY}&units=metric&lang=fr`)
      .then(r => r.json())
      .then(setWeather)
      .catch(() => {});
  }, [selectedCoordinates]);

  const firstName = user?.email?.split('@')[0] || 'Agriculteur';
  const dateStr   = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const temp      = weather ? Math.round(weather.main?.temp) : null;
  const humidity  = weather?.main?.humidity;
  const weatherDesc = weather?.weather?.[0]?.description || '';
  const weatherIcon = weatherDesc.includes('pluie') ? '🌧️' : weatherDesc.includes('nuage') ? '⛅' : weatherDesc.includes('orage') ? '⛈️' : '☀️';

  return (
    <div style={{ minHeight: '100vh', background: '#f2f4f7', fontFamily: F, paddingBottom: '1rem' }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(160deg, #011a12 0%, #022c22 50%, #064e3b 100%)',
        padding: '1.5rem 1.2rem 3rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(16,185,129,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(163,138,94,0.1)', pointerEvents: 'none' }} />

        {/* Salutation */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: F, fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.2rem', textTransform: 'capitalize' }}>
            {dateStr}
          </p>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.6rem', color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.3rem' }}>
            {greeting},<br />
            <span style={{ color: '#a38a5e' }}>{firstName} 👋</span>
          </h1>

          {/* Localité */}
          {hasLocation && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem' }}>
              <MapPin size={11} style={{ color: '#10b981' }} />
              <span style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>{selectedLocationName}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── CARTE MÉTÉO + STATS (overlap sur le hero) ── */}
      <div style={{ padding: '0 1rem', marginTop: '-1.5rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: weather ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>

          {/* Météo */}
          {weather && (
            <div style={{ borderRadius: '1.5rem', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', padding: '1.2rem', boxShadow: '0 8px 24px rgba(29,78,216,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '2.2rem', color: 'white', lineHeight: 1 }}>{temp}°</div>
                  <div style={{ fontFamily: F, fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem', textTransform: 'capitalize' }}>{weatherDesc}</div>
                </div>
                <span style={{ fontSize: '2.2rem' }}>{weatherIcon}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.8rem' }}>
                <span style={{ fontFamily: F, fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Droplets size={10} /> {humidity}%
                </span>
                <span style={{ fontFamily: F, fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Wind size={10} /> {Math.round((weather.wind?.speed || 0) * 3.6)} km/h
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ borderRadius: '1.5rem', background: 'white', padding: '1.2rem', boxShadow: '0 4px 20px rgba(6,78,59,0.08)' }}>
            <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Mon activité</div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.6rem', color: '#064e3b', lineHeight: 1 }}>{stats.scans}</div>
                <div style={{ fontFamily: F, fontSize: '0.62rem', color: '#9ca3af' }}>Scans</div>
              </div>
              <div style={{ width: '1px', background: '#e5e7eb' }} />
              <div>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.6rem', color: '#a38a5e', lineHeight: 1 }}>{stats.recs}</div>
                <div style={{ fontFamily: F, fontSize: '0.62rem', color: '#9ca3af' }}>Conseils</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIONS RAPIDES ── */}
      <div style={{ padding: '1.5rem 1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#1a2332', fontSize: '1rem', margin: 0 }}>Fonctionnalités</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={i} to={action.path} style={{ textDecoration: 'none' }}>
              <div style={{
                borderRadius: '1.3rem',
                padding: '1rem 0.75rem',
                textAlign: 'center',
                background: 'white',
                boxShadow: '0 2px 12px rgba(6,78,59,0.06)',
                transition: 'transform 0.15s',
                cursor: 'pointer',
                border: '1px solid rgba(6,78,59,0.05)',
              }}>
                <div style={{
                  width: '48px', height: '48px',
                  borderRadius: '1rem',
                  background: action.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.6rem',
                  color: 'white',
                  boxShadow: `0 4px 14px ${action.color}35`,
                }}>
                  {action.icon}
                </div>
                <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.75rem', color: '#1a2332', lineHeight: 1.2, marginBottom: '0.2rem' }}>
                  {action.label}
                </div>
                <div style={{ fontFamily: F, fontSize: '0.6rem', color: '#9ca3af', lineHeight: 1.3 }}>
                  {action.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── PRIX DU MARCHÉ ── */}
      <div style={{ padding: '1.5rem 1rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#1a2332', fontSize: '1rem', margin: 0 }}>Prix du marché</h2>
          <Link to="/market" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: F, fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
            Tout voir <ChevronRight size={13} />
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 2px 12px rgba(6,78,59,0.06)', border: '1px solid rgba(6,78,59,0.05)' }}>
          {MARKET_PRICES.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.9rem 1.2rem',
              borderBottom: i < MARKET_PRICES.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.8rem', background: '#f9f6f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  {item.name === 'Manioc' ? '🌿' : item.name === 'Maïs' ? '🌽' : item.name === 'Tomate' ? '🍅' : '🥜'}
                </div>
                <div>
                  <div style={{ fontFamily: F, fontWeight: 600, fontSize: '0.82rem', color: '#1a2332' }}>{item.name}</div>
                  <div style={{ fontFamily: F, fontSize: '0.62rem', color: '#9ca3af' }}>{item.unit}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: FH, fontWeight: 800, fontSize: '0.9rem', color: '#1a2332' }}>{item.price}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                  <TrendingUp size={10} style={{ color: item.up ? '#10b981' : '#ef4444', transform: item.up ? 'none' : 'rotate(180deg)' }} />
                  <span style={{ fontFamily: F, fontSize: '0.62rem', fontWeight: 700, color: item.up ? '#10b981' : '#ef4444' }}>{item.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ALERTE RAPIDE ── */}
      <div style={{ padding: '1.5rem 1rem 0' }}>
        <div style={{ borderRadius: '1.5rem', background: 'linear-gradient(135deg, #022c22, #064e3b)', padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={20} style={{ color: '#a38a5e' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FH, fontWeight: 700, color: 'white', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
              Scanner une plante malade
            </div>
            <div style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
              Prenez une photo et l'IA identifie la maladie en secondes
            </div>
          </div>
          <Link to="/disease-scanner" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={16} style={{ color: 'white' }} />
            </div>
          </Link>
        </div>
      </div>

      {/* ── LIEN PROFIL si non connecté ── */}
      {!user && (
        <div style={{ padding: '1.5rem 1rem 0' }}>
          <div style={{ borderRadius: '1.5rem', background: 'white', padding: '1.2rem 1.5rem', border: '1.5px solid rgba(163,138,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.88rem' }}>Créez votre compte</div>
              <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.1rem' }}>Sauvegardez vos analyses et accédez à plus de fonctionnalités</div>
            </div>
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <div style={{ padding: '0.6rem 1.2rem', borderRadius: '2rem', background: '#064e3b', fontFamily: F, fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
                Connexion
              </div>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
