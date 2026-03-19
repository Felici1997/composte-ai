/**
 * MobileHome.tsx — Page d'accueil mobile style app native
 * Inspiré Composte Agri Flutter : fond gris, cards blanches, typo franche
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLocationContext } from '@/contexts/LocationContext';
import { ChevronRight, TrendingUp, TrendingDown, MapPin, Droplets, Wind } from 'lucide-react';

const F  = "'DM Sans', 'Poppins', sans-serif";
const FH = "'DM Sans', 'Outfit', sans-serif";
const GREEN = '#1B5E3B';
const GREEN_LIGHT = '#E8F5EE';
const BG = '#F2F4F7';
const CARD = '#FFFFFF';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'bdc7bc29f0d1be26b9ba457903ad9ec5';

/* ─── SLIDES HERO (bannières produits) ─── */
const HERO_SLIDES = [
  { label: 'Scanner maladies',   sub: 'Diagnostiquez vos plantes en secondes',  emoji: '🔬', color: '#1B5E3B', path: '/disease-scanner' },
  { label: 'Météo agricole',     sub: 'Prévisions pour votre zone',              emoji: '🌤️', color: '#1565C0', path: '/weather' },
  { label: 'Analyse de sol',     sub: 'pH, nutriments, humidité',                emoji: '🌍', color: '#4E342E', path: '/soil-analysis' },
];

/* ─── SERVICES (comme "Nos Services" dans l'app Flutter) ─── */
const SERVICES = [
  { label: 'Scanner',    emoji: '🔬', path: '/disease-scanner' },
  { label: 'Météo',      emoji: '🌤️', path: '/weather' },
  { label: 'Sol',        emoji: '🌱', path: '/soil-analysis' },
  { label: 'Conseils',   emoji: '💡', path: '/recommendations' },
  { label: 'IA',         emoji: '🤖', path: '/ai-assistant' },
  { label: 'Marché',     emoji: '📊', path: '/market' },
];

/* ─── PRIX MARCHÉ ─── */
const MARKET_DATA = [
  { name: 'Concombre', price: '1 500', unit: 'FCFA/KG', trend: +3,  emoji: '🥒', category: 'Légumes' },
  { name: 'Manioc',    price: '850',   unit: 'FCFA/KG', trend: -2,  emoji: '🌿', category: 'Tubercules' },
  { name: 'Tomate',    price: '2 200', unit: 'FCFA/KG', trend: +8,  emoji: '🍅', category: 'Légumes' },
  { name: 'Arachide',  price: '1 800', unit: 'FCFA/KG', trend: +1,  emoji: '🥜', category: 'Légumineuses' },
  { name: 'Maïs',      price: '1 200', unit: 'FCFA/KG', trend: -4,  emoji: '🌽', category: 'Céréales' },
  { name: 'Banane',    price: '500',   unit: 'FCFA/KG', trend: +2,  emoji: '🍌', category: 'Fruits' },
];

/* ─── COMPOSANT PRODUIT CARD ─── */
function ProductCard({ item }: { item: typeof MARKET_DATA[0] }) {
  const up = item.trend > 0;
  return (
    <div style={{
      background: CARD, borderRadius: 16,
      padding: '12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      minWidth: '140px',
    }}>
      {/* Bouton En détail */}
      <div style={{ marginBottom: '6px' }}>
        <span style={{
          display: 'inline-block',
          background: GREEN, color: 'white',
          borderRadius: 20, padding: '3px 10px',
          fontFamily: F, fontWeight: 600, fontSize: '11px',
        }}>
          En détail
        </span>
      </div>
      {/* Emoji produit */}
      <div style={{ fontSize: '40px', textAlign: 'center', margin: '8px 0' }}>
        {item.emoji}
      </div>
      {/* Infos */}
      <div style={{ fontFamily: F, fontSize: '11px', color: GREEN, fontWeight: 600 }}>
        {item.category}
      </div>
      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '14px', color: '#1a1a1a', marginTop: '2px' }}>
        {item.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
        <span style={{ fontFamily: F, fontWeight: 700, fontSize: '13px', color: '#1a1a1a' }}>
          {item.price} {item.unit.split('/')[1] ? 'F/' + item.unit.split('/')[1] : 'FCFA'}
        </span>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '2px',
          fontFamily: F, fontWeight: 700, fontSize: '11px',
          color: up ? '#2E7D32' : '#C62828',
        }}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(item.trend)}%
        </span>
      </div>
    </div>
  );
}

/* ─── COMPOSANT PRINCIPAL ─── */
export default function MobileHome() {
  const { selectedLocationName, selectedCoordinates, hasLocation } = useLocationContext();
  const [user, setUser]         = useState<any>(null);
  const [weather, setWeather]   = useState<any>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  const now = new Date();
  const h   = now.getHours();
  const greeting = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!selectedCoordinates) return;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${selectedCoordinates.lat}&lon=${selectedCoordinates.lon}&appid=${API_KEY}&units=metric&lang=fr`)
      .then(r => r.json()).then(setWeather).catch(() => {});
  }, [selectedCoordinates]);

  // Auto-slide
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % HERO_SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  const firstName = user?.email?.split('@')[0] || null;
  const temp      = weather ? Math.round(weather.main?.temp) : null;

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: F, paddingBottom: '16px' }}>

      {/* ── SALUTATION ── */}
      <div style={{ padding: '4px 16px 12px', background: '#fff' }}>
        <div style={{ fontFamily: F, fontSize: '13px', color: '#757575' }}>
          {greeting}{firstName ? `, ${firstName}` : ''} 👋
        </div>
        {hasLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
            <MapPin size={12} color={GREEN} />
            <span style={{ fontFamily: F, fontSize: '12px', color: GREEN, fontWeight: 600 }}>
              {selectedLocationName}
            </span>
          </div>
        )}
        {weather && temp !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
            <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '24px', color: '#1a1a1a' }}>
              {temp}°C
            </span>
            <span style={{ fontFamily: F, fontSize: '12px', color: '#757575', textTransform: 'capitalize' }}>
              {weather.weather?.[0]?.description}
            </span>
            <span style={{ fontFamily: F, fontSize: '12px', color: '#757575', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Droplets size={12} color="#1565C0" /> {weather.main?.humidity}%
            </span>
            <span style={{ fontFamily: F, fontSize: '12px', color: '#757575', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Wind size={12} color="#546E7A" /> {Math.round((weather.wind?.speed || 0) * 3.6)}km/h
            </span>
          </div>
        )}
      </div>

      {/* ── HERO SLIDER ── */}
      <div style={{ padding: '12px 16px 0' }}>
        <Link to={HERO_SLIDES[slideIdx].path} style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            background: HERO_SLIDES[slideIdx].color,
            padding: '24px 20px 20px',
            position: 'relative', minHeight: '150px',
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}>
            {/* Cercle déco */}
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 140, height: 140, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
            }} />
            <div style={{
              position: 'absolute', top: 20, right: 20,
              fontSize: '64px', opacity: 0.9,
            }}>
              {HERO_SLIDES[slideIdx].emoji}
            </div>
            <div>
              <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '22px', color: '#fff', lineHeight: 1.2 }}>
                {HERO_SLIDES[slideIdx].label}
              </div>
              <div style={{ fontFamily: F, fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '4px' }}>
                {HERO_SLIDES[slideIdx].sub}
              </div>
            </div>
          </div>
        </Link>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIdx(i)} style={{
              width: i === slideIdx ? 18 : 7, height: 7,
              borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
              background: i === slideIdx ? GREEN : '#C8C8C8',
              transition: 'all 0.25s',
            }} />
          ))}
        </div>
      </div>

      {/* ── NOS SERVICES ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '17px', color: '#1a1a1a' }}>
            Nos Services
          </span>
          <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontFamily: F, fontSize: '13px', color: GREEN, fontWeight: 600 }}>Voir plus</span>
            <ChevronRight size={15} color={GREEN} />
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {SERVICES.map((s, i) => (
            <Link key={i} to={s.path} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                background: CARD, borderRadius: 14,
                padding: '16px 14px',
                minWidth: '90px',
                textAlign: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                border: '1px solid #F0F0F0',
              }}>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>{s.emoji}</div>
                <div style={{ fontFamily: F, fontSize: '12px', fontWeight: 500, color: '#424242' }}>
                  {s.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── NOS PRODUITS / PRIX MARCHÉ ── */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '17px', color: '#1a1a1a' }}>
            Nos Produits
          </span>
          <Link to="/market" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontFamily: F, fontSize: '13px', color: GREEN, fontWeight: 600 }}>Voir plus</span>
            <ChevronRight size={15} color={GREEN} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {MARKET_DATA.slice(0, 4).map((item, i) => (
            <Link key={i} to="/market" style={{ textDecoration: 'none' }}>
              <ProductCard item={item} />
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA CONNEXION (si non connecté) ── */}
      {!user && (
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{
            background: CARD, borderRadius: 16,
            padding: '16px',
            border: '1px solid #E8E8E8',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>
                Créez votre compte
              </div>
              <div style={{ fontFamily: F, fontSize: '12px', color: '#757575', marginTop: '2px' }}>
                Accédez à toutes les fonctionnalités
              </div>
            </div>
            <Link to="/auth" style={{ textDecoration: 'none' }}>
              <div style={{
                background: GREEN, color: '#fff',
                borderRadius: 24, padding: '9px 18px',
                fontFamily: F, fontWeight: 700, fontSize: '13px',
              }}>
                Connexion
              </div>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
