import React, { useState, useEffect } from 'react';
import { LocationSelector } from '@/components/LocationSelector';
import { useLocationContext } from '@/contexts/LocationContext';
import { MapPin, Wind, Droplets, Eye, Thermometer, RefreshCw, ChevronDown } from 'lucide-react';
import CulturePlanning from '@/components/CulturePlanning';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'bdc7bc29f0d1be26b9ba457903ad9ec5';

const ALERTS = [
  { type: 'warn', icon: '⚠️', t: 'Risque de fortes pluies', d: 'Des précipitations intenses sont prévues en fin de semaine. Prévoir un drainage des parcelles basses.' },
  { type: 'info', icon: '🌱', t: 'Conditions de plantation optimales', d: 'Températures douces et humidité modérée — idéal pour les semis de maïs et légumineuses.' },
  { type: 'ok',   icon: '💧', t: 'Bonne journée d\'irrigation', d: 'Faible évapotranspiration aujourd\'hui. Privilégiez l\'arrosage ce matin.' },
];

const INSIGHTS = [
  { icon: '💧', t: 'Irrigation', d: 'Humidité élevée — réduisez la fréquence d\'arrosage de 30% cette semaine.' },
  { icon: '🦠', t: 'Risque maladies', d: 'Forte humidité = risque fongique. Appliquez un traitement préventif sur le manioc.' },
  { icon: '🌾', t: 'Fenêtre de récolte', d: 'Temps sec prévu jeudi-vendredi — moment idéal pour récolter et sécher les arachides.' },
];

export default function Weather() {
  const { selectedLocationName, selectedCoordinates, setLocation, hasLocation, primaryCrops } = useLocationContext();
  const [showLoc, setShowLoc] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUp, setLastUp] = useState<Date | null>(null);

  useEffect(() => { if (selectedCoordinates) fetchWeather(selectedCoordinates.lat, selectedCoordinates.lon); }, [selectedCoordinates]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const [cur, fore] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`).then(r => r.json()),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=fr`).then(r => r.json()),
      ]);
      setWeather(cur);
      if (fore.list) {
        const days: any[] = [];
        const seen = new Set<string>();
        fore.list.forEach((item: any) => {
          const d = item.dt_txt.split(' ')[0];
          if (!seen.has(d) && days.length < 7) { seen.add(d); days.push(item); }
        });
        setForecast(days);
      }
      setLastUp(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const condIcon = (c: string = '') => {
    if (c.includes('rain') || c.includes('pluie')) return '🌧️';
    if (c.includes('cloud') || c.includes('nuage') || c.includes('couvert')) return '☁️';
    if (c.includes('clear') || c.includes('dégagé') || c.includes('ensoleillé')) return '☀️';
    return '⛅';
  };

  const alertStyle = (type: string) => ({
    borderLeft: `4px solid ${type === 'warn' ? '#f59e0b' : type === 'info' ? '#064e3b' : '#10b981'}`,
    background: type === 'warn' ? 'rgba(245,158,11,0.05)' : type === 'info' ? 'rgba(6,78,59,0.04)' : 'rgba(16,185,129,0.05)',
  });

  const dayFR = (dtTxt: string) => {
    const d = new Date(dtTxt);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f6f0', fontFamily: F }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#022c22 0%,#064e3b 100%)', paddingTop: '7rem', paddingBottom: '3.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1rem' }}>Météo agricole</span>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: '0.8rem' }}>
            Prévisions pour<br /><span style={{ color: '#a38a5e', fontStyle: 'italic' }}>{hasLocation ? selectedLocationName : 'votre zone.'}</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => setShowLoc(!showLoc)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontFamily: F, fontSize: '0.78rem', fontWeight: 600, color: 'white' }}>
              <MapPin size={14} color="#10b981" />
              {hasLocation ? selectedLocationName : 'Choisir ma localité'}
              <ChevronDown size={13} />
            </button>
            {lastUp && (
              <span style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                Mis à jour {lastUp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {hasLocation && (
              <button onClick={() => selectedCoordinates && fetchWeather(selectedCoordinates.lat, selectedCoordinates.lon)} disabled={loading}
                style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', color: 'white' }}
                className={loading ? 'animate-spin' : ''}>
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showLoc && (
        <div style={{ maxWidth: '960px', margin: '-1rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(6,78,59,0.1)', boxShadow: '0 8px 40px rgba(6,78,59,0.08)' }}>
            <LocationSelector selectedLocation={selectedLocationName}
              onLocationChange={(n, c, d) => { setLocation(n, c, d); setShowLoc(false); if (c) fetchWeather(c.lat, c.lon); }}
              showWeather={false} />
          </div>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Météo actuelle */}
        {weather ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
            {/* Température principale */}
            <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.05)', gridColumn: 'span 1', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '4rem' }}>{condIcon(weather.weather?.[0]?.description)}</div>
              <div>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '3.5rem', color: '#064e3b', lineHeight: 1 }}>{Math.round(weather.main?.temp)}°</div>
                <div style={{ fontFamily: F, fontSize: '0.9rem', color: '#6b7280', textTransform: 'capitalize', marginTop: '0.3rem' }}>{weather.weather?.[0]?.description}</div>
                <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>Ressenti {Math.round(weather.main?.feels_like)}°C</div>
              </div>
            </div>

            {/* Stats */}
            {[
              { icon: <Droplets size={18} />, label: 'Humidité', val: `${weather.main?.humidity}%`, color: '#3b82f6' },
              { icon: <Wind size={18} />, label: 'Vent', val: `${Math.round((weather.wind?.speed || 0) * 3.6)} km/h`, color: '#64748b' },
              { icon: <Eye size={18} />, label: 'Visibilité', val: `${((weather.visibility || 0) / 1000).toFixed(0)} km`, color: '#8b5cf6' },
              { icon: <Thermometer size={18} />, label: 'Pression', val: `${weather.main?.pressure} hPa`, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '2rem', padding: '1.5rem', border: '1px solid rgba(6,78,59,0.07)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '1rem', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: F, fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                  <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.2rem', marginTop: '0.1rem' }}>{s.val}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && !hasLocation && (
            <div style={{ background: 'white', borderRadius: '2rem', padding: '3rem', textAlign: 'center', border: '1px solid rgba(6,78,59,0.07)', marginBottom: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌤️</div>
              <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Sélectionnez votre localité</div>
              <div style={{ fontFamily: F, fontSize: '0.85rem', color: '#9ca3af' }}>Choisissez votre zone pour afficher la météo en temps réel</div>
            </div>
          )
        )}

        {/* Prévisions 7 jours */}
        {forecast.length > 0 && (
          <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)', marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>📅 Prévisions 7 jours</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', overflowX: 'auto' }}>
              {forecast.map((day, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '1rem 0.5rem', borderRadius: '1.2rem', background: i === 0 ? '#064e3b' : '#f9f6f0', minWidth: '70px' }}>
                  <div style={{ fontFamily: F, fontSize: '0.65rem', color: i === 0 ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{i === 0 ? "Auj." : dayFR(day.dt_txt)}</div>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{condIcon(day.weather?.[0]?.description)}</div>
                  <div style={{ fontFamily: FH, fontWeight: 800, color: i === 0 ? 'white' : '#064e3b', fontSize: '1rem' }}>{Math.round(day.main?.temp_max)}°</div>
                  <div style={{ fontFamily: F, fontSize: '0.7rem', color: i === 0 ? 'rgba(255,255,255,0.5)' : '#9ca3af' }}>{Math.round(day.main?.temp_min)}°</div>
                  {day.pop > 0.2 && <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#3b82f6', marginTop: '0.3rem' }}>💧 {Math.round(day.pop * 100)}%</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          {/* Alertes */}
          <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)' }}>
            <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem', marginBottom: '1.2rem' }}>🔔 Alertes agricoles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '1rem', ...alertStyle(a.type) }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{a.icon}</span>
                    <div>
                      <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{a.t}</div>
                      <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>{a.d}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)' }}>
            <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem', marginBottom: '1.2rem' }}>💡 Conseils météo</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {INSIGHTS.map((ins, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{ins.icon}</span>
                  <div>
                    <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.2rem' }}>{ins.t}</div>
                    <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.5 }}>{ins.d}</div>
                  </div>
                </div>
              ))}
              {primaryCrops.length > 0 && (
                <div style={{ borderTop: '1px solid rgba(6,78,59,0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.6rem' }}>Vos cultures :</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {primaryCrops.map((c, i) => (
                      <span key={i} style={{ padding: '0.25rem 0.7rem', borderRadius: '2rem', background: 'rgba(6,78,59,0.07)', fontFamily: F, fontSize: '0.72rem', color: '#064e3b', fontWeight: 600 }}>{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* ══ PLANNING DES CULTURES ══ */}
        <div style={{ borderTop: '2px dashed rgba(6,78,59,0.08)', paddingTop: '2.5rem', marginTop: '1rem' }}>
          <CulturePlanning weather={weather} forecast={forecast} />
        </div>
      </div>
    </div>
  );
}
