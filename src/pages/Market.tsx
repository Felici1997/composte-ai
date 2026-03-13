import React, { useState, useEffect } from 'react';
import { useLocationContext } from '@/contexts/LocationContext';
import { LocationSelector } from '@/components/LocationSelector';
import { TrendingUp, TrendingDown, RefreshCw, MapPin, ChevronDown, Bell, BarChart3 } from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

interface Crop {
  name: string; icon: string; price: number; unit: string;
  change: number; min: number; max: number; vol: string;
  reco: 'Vendre' | 'Attendre' | 'Acheter'; cat: string;
}

const CROPS: Crop[] = [
  { name: 'Manioc',          icon: '🌿', price: 85,    unit: 'kg',  change: 3.2,  min: 70,  max: 100,  vol: 'Élevé',   reco: 'Vendre',  cat: 'Tubercule' },
  { name: 'Maïs',            icon: '🌽', price: 175,   unit: 'kg',  change: -1.5, min: 150, max: 200,  vol: 'Moyen',   reco: 'Attendre',cat: 'Céréale' },
  { name: 'Banane plantain', icon: '🍌', price: 350,   unit: 'régime', change: 7.8, min: 280, max: 420, vol: 'Élevé',  reco: 'Vendre',  cat: 'Fruit' },
  { name: 'Arachides',       icon: '🥜', price: 1200,  unit: 'kg',  change: 2.1,  min: 1000, max: 1500, vol: 'Moyen', reco: 'Attendre',cat: 'Légumineuse' },
  { name: 'Cacao',           icon: '🍫', price: 4500,  unit: 'kg',  change: 12.4, min: 3800, max: 5200, vol: 'Élevé', reco: 'Vendre',  cat: 'Cash crop' },
  { name: 'Café',            icon: '☕', price: 3200,  unit: 'kg',  change: 5.6,  min: 2800, max: 3800, vol: 'Moyen', reco: 'Vendre',  cat: 'Cash crop' },
  { name: 'Palmier à huile', icon: '🌴', price: 650,   unit: 'kg',  change: -2.3, min: 550, max: 780,  vol: 'Faible',  reco: 'Attendre',cat: 'Oléagineux' },
  { name: 'Igname',          icon: '🍠', price: 300,   unit: 'kg',  change: -4.1, min: 250, max: 380,  vol: 'Faible',  reco: 'Attendre',cat: 'Tubercule' },
  { name: 'Légumes feuilles',icon: '🥬', price: 200,   unit: 'botte', change: 15.2, min: 150, max: 280, vol: 'Élevé', reco: 'Vendre',  cat: 'Maraîchage' },
  { name: 'Canne à sucre',   icon: '🎋', price: 55,    unit: 'kg',  change: 1.8,  min: 45, max: 65,    vol: 'Faible',  reco: 'Attendre',cat: 'Industriel' },
];

const CATS = ['Tous', 'Tubercule', 'Céréale', 'Fruit', 'Légumineuse', 'Cash crop', 'Oléagineux', 'Maraîchage'];

export default function Market() {
  const { selectedLocationName, hasLocation, primaryCrops, setLocation } = useLocationContext();
  const [cat, setCat] = useState('Tous');
  const [showLoc, setShowLoc] = useState(false);
  const [search, setSearch] = useState('');
  const [lastUp, setLastUp] = useState(new Date());
  const [selected, setSelected] = useState<Crop | null>(null);
  const [alertCrop, setAlertCrop] = useState('');

  const refresh = () => setLastUp(new Date());

  const visible = CROPS
    .filter(c => cat === 'Tous' || c.cat === cat)
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()))
    .filter(c => !hasLocation || primaryCrops.length === 0 || primaryCrops.some(p => c.name.toLowerCase().includes(p.toLowerCase().split(' ')[0])) || cat !== 'Tous');

  const recoStyle = (r: string) => ({
    'Vendre':   { bg: 'rgba(16,185,129,0.1)',  color: '#10b981' },
    'Attendre': { bg: 'rgba(245,158,11,0.1)',   color: '#f59e0b' },
    'Acheter':  { bg: 'rgba(59,130,246,0.1)',   color: '#3b82f6' },
  }[r] || { bg: '#f9f6f0', color: '#9ca3af' });

  const fmtFCFA = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n.toString();

  return (
    <div style={{ minHeight: '100vh', background: '#f9f6f0', fontFamily: F }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#022c22 0%,#064e3b 100%)', paddingTop: '7rem', paddingBottom: '3.5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1rem' }}>Prix du marché</span>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: '0.8rem' }}>
                Prix agricoles<br /><span style={{ color: '#a38a5e', fontStyle: 'italic' }}>en FCFA.</span>
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => setShowLoc(!showLoc)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontFamily: F, fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>
                  <MapPin size={13} color="#10b981" />
                  {hasLocation ? selectedLocationName : 'Ma zone'}
                  <ChevronDown size={12} />
                </button>
                <span style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                  Mis à jour {lastUp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            <button onClick={refresh} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.3rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontFamily: F, fontSize: '0.72rem', fontWeight: 600, color: 'white' }}>
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </div>
      </div>

      {showLoc && (
        <div style={{ maxWidth: '1100px', margin: '-0.5rem auto 0', padding: '0 1.5rem' }}>
          <div style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(6,78,59,0.1)', boxShadow: '0 8px 40px rgba(6,78,59,0.08)', marginBottom: '1rem' }}>
            <LocationSelector selectedLocation={selectedLocationName} onLocationChange={(n, c, d) => { setLocation(n, c, d); setShowLoc(false); }} showWeather={false} />
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {/* Stats globales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: '📈', val: `${CROPS.filter(c => c.change > 0).length}`, label: 'Cultures en hausse', color: '#10b981' },
            { icon: '📉', val: `${CROPS.filter(c => c.change < 0).length}`, label: 'Cultures en baisse', color: '#ef4444' },
            { icon: '💰', val: `${CROPS.filter(c => c.reco === 'Vendre').length}`, label: 'Conseils : Vendre', color: '#a38a5e' },
            { icon: '🕐', val: '10', label: 'Cultures suivies', color: '#064e3b' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '1.5rem', padding: '1.2rem', border: '1px solid rgba(6,78,59,0.07)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{s.icon}</div>
              <div style={{ fontFamily: FH, fontWeight: 800, color: s.color, fontSize: '1.6rem', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: F, fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher une culture…"
            style={{ padding: '0.7rem 1rem', borderRadius: '1.2rem', border: '1.5px solid rgba(6,78,59,0.12)', background: 'white', fontFamily: F, fontSize: '0.82rem', color: '#064e3b', outline: 'none', flex: '1', minWidth: '180px' }} />
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: '0.5rem 1rem', borderRadius: '2rem', fontFamily: F, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  background: cat === c ? '#064e3b' : 'white', color: cat === c ? 'white' : '#064e3b',
                  border: `1.5px solid ${cat === c ? '#064e3b' : 'rgba(6,78,59,0.12)'}` }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Grille cultures */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {(visible.length ? visible : CROPS.filter(c => cat === 'Tous' || c.cat === cat)).map((crop, i) => {
            const rs = recoStyle(crop.reco);
            const isUp = crop.change >= 0;
            const isSel = selected?.name === crop.name;
            return (
              <button key={i} onClick={() => setSelected(isSel ? null : crop)}
                style={{ textAlign: 'left', background: 'white', borderRadius: '1.8rem', padding: '1.5rem', border: `2px solid ${isSel ? '#064e3b' : 'rgba(6,78,59,0.07)'}`, cursor: 'pointer', transition: 'all 0.15s', transform: isSel ? 'translateY(-2px)' : 'none', boxShadow: isSel ? '0 8px 30px rgba(6,78,59,0.12)' : '0 2px 12px rgba(6,78,59,0.04)' }}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.8rem' }}>{crop.icon}</span>
                    <div>
                      <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '0.9rem', lineHeight: 1 }}>{crop.name}</div>
                      <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{crop.cat}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.7rem', borderRadius: '2rem', background: isUp ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)' }}>
                    {isUp ? <TrendingUp size={12} color="#10b981" /> : <TrendingDown size={12} color="#ef4444" />}
                    <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.72rem', color: isUp ? '#10b981' : '#ef4444' }}>{isUp ? '+' : ''}{crop.change}%</span>
                  </div>
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                  <div style={{ fontFamily: FH, fontWeight: 900, color: '#064e3b', fontSize: '1.8rem', lineHeight: 1 }}>
                    {fmtFCFA(crop.price)}
                  </div>
                  <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.2rem' }}>FCFA / {crop.unit}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ padding: '0.3rem 0.8rem', borderRadius: '2rem', background: rs.bg }}>
                    <span style={{ fontFamily: F, fontSize: '0.68rem', fontWeight: 700, color: rs.color }}>{crop.reco}</span>
                  </div>
                  <span style={{ fontFamily: F, fontSize: '0.68rem', color: '#9ca3af' }}>Vol. {crop.vol}</span>
                </div>

                {isSel && (
                  <div style={{ borderTop: '1px solid rgba(6,78,59,0.08)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      <div style={{ background: '#f9f6f0', borderRadius: '0.8rem', padding: '0.7rem' }}>
                        <div style={{ fontFamily: F, fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Min semaine</div>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem' }}>{fmtFCFA(crop.min)} FCFA</div>
                      </div>
                      <div style={{ background: '#f9f6f0', borderRadius: '0.8rem', padding: '0.7rem' }}>
                        <div style={{ fontFamily: F, fontSize: '0.6rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Max semaine</div>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem' }}>{fmtFCFA(crop.max)} FCFA</div>
                      </div>
                    </div>
                    {/* Mini sparkline */}
                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                      <div style={{ height: '100%', width: `${((crop.price - crop.min) / (crop.max - crop.min)) * 100}%`, background: isUp ? '#10b981' : '#ef4444', borderRadius: '2px' }} />
                    </div>
                    <button onClick={e => { e.stopPropagation(); setAlertCrop(crop.name); }}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '1rem', background: '#064e3b', border: 'none', fontFamily: F, fontSize: '0.68rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                      <Bell size={12} /> Créer une alerte prix
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Alerte créée */}
        {alertCrop && (
          <div style={{ position: 'fixed', bottom: '6rem', right: '1.5rem', background: '#064e3b', borderRadius: '1.2rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', boxShadow: '0 8px 40px rgba(6,78,59,0.3)', zIndex: 100 }}>
            <Bell size={16} color="#10b981" />
            <div>
              <div style={{ fontFamily: FH, fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>Alerte activée</div>
              <div style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)' }}>Vous serez notifié si le prix du {alertCrop} change.</div>
            </div>
            <button onClick={() => setAlertCrop('')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
          </div>
        )}

        {/* Note */}
        <div style={{ textAlign: 'center', padding: '1.5rem', background: 'white', borderRadius: '2rem', border: '1px solid rgba(6,78,59,0.07)' }}>
          <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.6 }}>
            ℹ️ Prix indicatifs collectés sur les marchés du Congo Brazzaville. Ils varient selon la région, la qualité et la saison. Consultez votre marché local pour une cotation précise.
          </div>
        </div>
      </div>
    </div>
  );
}
