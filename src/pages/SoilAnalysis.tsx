import React, { useState } from 'react';
import { useLocationContext } from '@/contexts/LocationContext';
import { LocationSelector } from '@/components/LocationSelector';
import { openAIService } from '@/services/openai';
import { useToast } from '@/hooks/use-toast';
import { MapPin, ChevronDown, Loader2, Download, RotateCcw, CheckCircle, AlertTriangle } from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

/* ─── DONNÉES SOL CONGO ─── */
const SOLS = [
  { val: 'ferralitique', label: 'Ferralitique', desc: 'Sol rouge acide, typique forêt Congo', icon: '🟥', ph: 5.5, N: 72, P: 55, K: 68 },
  { val: 'sableux',      label: 'Sableux',       desc: 'Sol léger, drainage rapide',           icon: '🏖️', ph: 6.2, N: 58, P: 48, K: 62 },
  { val: 'argileux',     label: 'Argileux',       desc: 'Sol lourd, retient l\'eau',            icon: '🧱', ph: 6.8, N: 82, P: 70, K: 78 },
  { val: 'limoneux',     label: 'Limoneux',       desc: 'Sol fertile et équilibré',             icon: '🌱', ph: 6.5, N: 88, P: 74, K: 85 },
  { val: 'lateritique',  label: 'Latéritique',    desc: 'Sol cuirassé, savanes',                icon: '🟤', ph: 5.8, N: 65, P: 50, K: 60 },
  { val: 'tourbeux',     label: 'Tourbeux',       desc: 'Sol organique riche, zones humides',   icon: '🌊', ph: 4.8, N: 90, P: 62, K: 55 },
];

const SAISONS = [
  { val: 'grande-pluie', label: 'Grande saison des pluies', icon: '🌧️', mois: 'Oct–Déc' },
  { val: 'petite-pluie', label: 'Petite saison des pluies', icon: '🌦️', mois: 'Mar–Mai' },
  { val: 'grande-seche', label: 'Grande saison sèche',      icon: '☀️', mois: 'Jun–Sep' },
  { val: 'petite-seche', label: 'Petite saison sèche',      icon: '🌤️', mois: 'Jan–Fév' },
];

const HUMIDITE = [
  { val: 'faible',  label: 'Faible', icon: '🏜️' },
  { val: 'moyen',   label: 'Moyenne',icon: '🌿' },
  { val: 'eleve',   label: 'Élevée', icon: '💧' },
];

function GaugeBar({ val, max = 100, color }: { val: number; max?: number; color: string }) {
  const pct = Math.min(100, (val / max) * 100);
  const statusColor = pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af' }}>{pct >= 75 ? 'Optimal' : pct >= 50 ? 'Acceptable' : 'Faible'}</span>
        <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.85rem', color: statusColor }}>{val}{max === 14 ? '' : '%'}</span>
      </div>
      <div style={{ height: '8px', borderRadius: '4px', background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: '4px', background: statusColor, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.05)', ...style }}>
      {children}
    </div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: F, fontSize: '0.68rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.12em', marginBottom: '0.8rem' }}>{children}</div>;
}

export default function SoilAnalysis() {
  const { selectedLocationName, hasLocation, setLocation, primaryCrops, soilTypes, bestSeasons } = useLocationContext();
  const [showLoc, setShowLoc]     = useState(false);
  const [sol, setSol]             = useState('');
  const [saison, setSaison]       = useState('');
  const [humidite, setHumidite]   = useState('');
  const [phManuel, setPhManuel]   = useState('');
  const [budget, setBudget]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<string>('');
  const [solData, setSolData]     = useState<typeof SOLS[0] | null>(null);
  const { toast } = useToast();

  const analyze = async () => {
    if (!sol) { toast({ title: 'Sélectionnez un type de sol', variant: 'destructive' }); return; }
    if (!saison) { toast({ title: 'Sélectionnez la saison en cours', variant: 'destructive' }); return; }
    setLoading(true);
    const found = SOLS.find(s => s.val === sol)!;
    setSolData(found);
    const saisonLabel = SAISONS.find(s => s.val === saison)?.label || saison;
    try {
      const resp = await openAIService.generateCropRecommendation(
        found.label,
        saisonLabel,
        selectedLocationName || 'Congo Brazzaville',
        budget ? parseInt(budget) : undefined
      );
      setResult(resp);
    } catch {
      toast({ title: 'Erreur IA', description: 'Impossible de générer l\'analyse. Vérifiez votre clé OpenAI.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const reset = () => { setResult(''); setSolData(null); setSol(''); setSaison(''); setHumidite(''); setPhManuel(''); setBudget(''); };

  const exportReport = () => {
    if (!solData) return;
    const txt = `RAPPORT D'ANALYSE DE SOL — COMPOSTE AI
Date : ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
Localité : ${selectedLocationName || 'Non renseigné'}
Type de sol : ${solData.label}
Saison : ${SAISONS.find(s => s.val === saison)?.label || ''}
pH estimé : ${phManuel || solData.ph}
Humidité : ${humidite}

DONNÉES NUTRITIVES ESTIMÉES :
Azote (N) : ${solData.N}%
Phosphore (P) : ${solData.P}%
Potassium (K) : ${solData.K}%

RECOMMANDATIONS IA :
${result}

---
Généré par Composte AI · composte-ai.vercel.app`;
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
    a.download = `analyse-sol-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    toast({ title: 'Rapport exporté !' });
  };

  const phVal = phManuel ? parseFloat(phManuel) : (solData?.ph || 0);
  const phPct = phVal ? ((phVal - 3.5) / (9 - 3.5)) * 100 : 0;
  const phColor = phVal >= 6 && phVal <= 7.5 ? '#10b981' : phVal >= 5 && phVal < 6 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ minHeight: '100vh', background: '#f9f6f0', fontFamily: F }}>

      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(160deg,#022c22 0%,#064e3b 100%)', paddingTop: '7rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1rem' }}>
            Agronomie IA
          </span>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: '0.8rem' }}>
            Analyse de sol<br /><span style={{ color: '#a38a5e', fontStyle: 'italic' }}>adaptée au Congo.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.8, maxWidth: '38rem' }}>
            Saisissez les caractéristiques de votre parcelle. L'IA génère des recommandations d'engrais et de cultures adaptées à votre sol et votre saison.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

        {!result ? (
          /* ── FORMULAIRE ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

            {/* Localité */}
            <Card style={{ gridColumn: '1 / -1' }}>
              <SLabel>📍 Votre localité</SLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  {hasLocation ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '1rem', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '1rem' }}>{selectedLocationName}</div>
                        {soilTypes.length > 0 && <div style={{ fontFamily: F, fontSize: '0.72rem', color: '#9ca3af' }}>Sols : {soilTypes.slice(0,2).join(', ')}</div>}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontFamily: F, color: '#9ca3af', fontSize: '0.88rem' }}>Aucune localité — les données sont génériques</div>
                  )}
                </div>
                <button onClick={() => setShowLoc(!showLoc)} className="btn-forest"
                  style={{ padding: '0.6rem 1.4rem', fontSize: '0.65rem' }}>
                  {hasLocation ? 'Changer' : 'Choisir ma zone'}
                </button>
              </div>
              {showLoc && (
                <div style={{ marginTop: '1.2rem', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid rgba(6,78,59,0.1)' }}>
                  <LocationSelector selectedLocation={selectedLocationName}
                    onLocationChange={(n, c, d) => { setLocation(n, c, d); setShowLoc(false); }}
                    showWeather={false} />
                </div>
              )}
            </Card>

            {/* Type de sol */}
            <Card style={{ gridColumn: '1 / -1' }}>
              <SLabel>🌍 Type de sol de votre parcelle</SLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                {SOLS.map(s => (
                  <button key={s.val} onClick={() => setSol(s.val)}
                    style={{ padding: '1rem', borderRadius: '1.2rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      background: sol === s.val ? '#064e3b' : '#f9f6f0',
                      border: `2px solid ${sol === s.val ? '#064e3b' : 'rgba(6,78,59,0.1)'}`,
                      boxShadow: sol === s.val ? '0 4px 20px rgba(6,78,59,0.2)' : 'none' }}>
                    <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.82rem', color: sol === s.val ? 'white' : '#064e3b' }}>{s.label}</div>
                    <div style={{ fontFamily: F, fontSize: '0.65rem', color: sol === s.val ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginTop: '0.2rem', lineHeight: 1.4 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Saison */}
            <Card>
              <SLabel>📅 Saison actuelle</SLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {SAISONS.map(s => (
                  <button key={s.val} onClick={() => setSaison(s.val)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '1rem', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                      background: saison === s.val ? '#a38a5e' : '#f9f6f0',
                      border: `2px solid ${saison === s.val ? '#a38a5e' : 'rgba(163,138,94,0.1)'}` }}>
                    <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
                    <div>
                      <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.82rem', color: saison === s.val ? 'white' : '#064e3b' }}>{s.label}</div>
                      <div style={{ fontFamily: F, fontSize: '0.65rem', color: saison === s.val ? 'rgba(255,255,255,0.65)' : '#9ca3af' }}>{s.mois}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>

            {/* Paramètres complémentaires */}
            <Card>
              <SLabel>🔬 Paramètres optionnels</SLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                {/* Humidité */}
                <div>
                  <div style={{ fontFamily: F, fontSize: '0.75rem', fontWeight: 600, color: '#064e3b', marginBottom: '0.6rem' }}>Humidité du sol</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {HUMIDITE.map(h => (
                      <button key={h.val} onClick={() => setHumidite(h.val)}
                        style={{ flex: 1, padding: '0.6rem', borderRadius: '0.8rem', cursor: 'pointer', transition: 'all 0.15s',
                          background: humidite === h.val ? '#064e3b' : '#f9f6f0',
                          border: `1.5px solid ${humidite === h.val ? '#064e3b' : 'rgba(6,78,59,0.1)'}` }}>
                        <div style={{ fontSize: '1rem' }}>{h.icon}</div>
                        <div style={{ fontFamily: F, fontSize: '0.65rem', fontWeight: 600, color: humidite === h.val ? 'white' : '#064e3b', marginTop: '0.2rem' }}>{h.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* pH manuel */}
                <div>
                  <div style={{ fontFamily: F, fontSize: '0.75rem', fontWeight: 600, color: '#064e3b', marginBottom: '0.5rem' }}>pH mesuré (si connu)</div>
                  <input type="number" step="0.1" min="3.5" max="9" value={phManuel}
                    onChange={e => setPhManuel(e.target.value)}
                    placeholder="ex : 6.5"
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1.5px solid rgba(6,78,59,0.12)', background: '#f9f6f0', fontFamily: F, fontSize: '0.86rem', color: '#064e3b', outline: 'none' }} />
                  <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.3rem' }}>Laissez vide pour utiliser la valeur typique de votre sol</div>
                </div>

                {/* Budget */}
                <div>
                  <div style={{ fontFamily: F, fontSize: '0.75rem', fontWeight: 600, color: '#064e3b', marginBottom: '0.5rem' }}>Budget intrants (FCFA)</div>
                  <input type="number" value={budget} onChange={e => setBudget(e.target.value)}
                    placeholder="ex : 50000"
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '1rem', border: '1.5px solid rgba(6,78,59,0.12)', background: '#f9f6f0', fontFamily: F, fontSize: '0.86rem', color: '#064e3b', outline: 'none' }} />
                </div>
              </div>
            </Card>

            {/* CTA */}
            <div style={{ gridColumn: '1 / -1' }}>
              <button onClick={analyze} disabled={loading || !sol || !saison} className="btn-argile w-full flex items-center justify-center gap-3"
                style={{ padding: '1.2rem', fontSize: '0.8rem', borderRadius: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  opacity: loading || !sol || !saison ? 0.6 : 1, cursor: loading || !sol || !saison ? 'not-allowed' : 'pointer' }}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Analyse en cours…</> : '🌍 Analyser mon sol'}
              </button>
            </div>
          </div>

        ) : (
          /* ── RÉSULTATS ── */
          <div>
            {/* Barre d'actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem', borderRadius: '2rem', background: 'white', border: '1.5px solid rgba(6,78,59,0.15)', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: '#064e3b', cursor: 'pointer' }}>
                <RotateCcw size={14} /> Nouvelle analyse
              </button>
              <button onClick={exportReport} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.4rem', borderRadius: '2rem', background: '#064e3b', border: 'none', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: 'white', cursor: 'pointer' }}>
                <Download size={14} /> Exporter le rapport
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

              {/* Résumé sol */}
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>{solData?.icon}</span>
                  <div>
                    <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem' }}>{solData?.label}</div>
                    <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af' }}>{selectedLocationName || 'Congo Brazzaville'}</div>
                  </div>
                </div>

                {/* Score global */}
                <div style={{ textAlign: 'center', padding: '1.5rem', borderRadius: '1.5rem', background: 'linear-gradient(135deg,#064e3b,#022c22)', marginBottom: '1.5rem' }}>
                  <div style={{ fontFamily: F, fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>Score de fertilité</div>
                  <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '3.5rem', color: 'white', lineHeight: 1 }}>
                    {Math.round((solData!.N + solData!.P + solData!.K) / 3)}
                  </div>
                  <div style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>sur 100</div>
                </div>

                {/* Nutriments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {[
                    { label: 'Azote (N)', val: solData!.N, icon: '🌿' },
                    { label: 'Phosphore (P)', val: solData!.P, icon: '⚡' },
                    { label: 'Potassium (K)', val: solData!.K, icon: '💪' },
                  ].map((n, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.9rem' }}>{n.icon}</span>
                        <span style={{ fontFamily: F, fontSize: '0.78rem', fontWeight: 600, color: '#064e3b' }}>{n.label}</span>
                      </div>
                      <GaugeBar val={n.val} color="#064e3b" />
                    </div>
                  ))}

                  {/* pH */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.9rem' }}>⚖️</span>
                      <span style={{ fontFamily: F, fontSize: '0.78rem', fontWeight: 600, color: '#064e3b' }}>pH du sol</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af' }}>Acide ← → Alcalin</span>
                      <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.85rem', color: phColor }}>
                        {phVal.toFixed(1)} {phVal >= 6 && phVal <= 7.5 ? '✅' : '⚠️'}
                      </span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 35%, #10b981 50%, #f59e0b 75%, #ef4444 100%)', position: 'relative', overflow: 'visible' }}>
                      <div style={{ position: 'absolute', width: '14px', height: '14px', borderRadius: '50%', background: 'white', border: `3px solid ${phColor}`, top: '50%', transform: 'translate(-50%,-50%)', left: `${phPct}%`, transition: 'left 1s ease', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                      <span style={{ fontFamily: F, fontSize: '0.6rem', color: '#9ca3af' }}>3.5</span>
                      <span style={{ fontFamily: F, fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>6–7.5 idéal</span>
                      <span style={{ fontFamily: F, fontSize: '0.6rem', color: '#9ca3af' }}>9</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Couches de sol */}
              <Card>
                <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem', marginBottom: '1.5rem' }}>🏔️ Profil du sol</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Couche arable', depth: '0–20 cm', health: solData!.N, color: '#a38a5e', desc: 'Zone racinaire active, riche en matière organique' },
                    { label: 'Sous-sol',       depth: '20–60 cm', health: Math.round(solData!.N * 0.82), color: '#78716c', desc: 'Réserve en eau et minéraux, moins actif biologiquement' },
                    { label: 'Substrat',       depth: '60 cm+',  health: Math.round(solData!.N * 0.65), color: '#57534e', desc: 'Roche mère altérée, ancrage des racines profondes' },
                  ].map((c, i) => (
                    <div key={i} style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(6,78,59,0.06)' }}>
                      <div style={{ padding: '0.8rem 1rem', background: c.color, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontFamily: FH, fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>{c.label}</div>
                          <div style={{ fontFamily: F, fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)' }}>{c.depth}</div>
                        </div>
                        <div style={{ fontFamily: FH, fontWeight: 800, color: 'white', fontSize: '1.2rem' }}>{c.health}%</div>
                      </div>
                      <div style={{ padding: '0.6rem 1rem', background: '#f9f6f0' }}>
                        <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af' }}>{c.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Humidité */}
                {humidite && (
                  <div style={{ padding: '1rem', borderRadius: '1rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>💧 Humidité déclarée</div>
                    <div style={{ fontFamily: F, fontSize: '0.78rem', color: '#374151' }}>
                      {humidite === 'faible' && 'Sol sec → Prévoyez une irrigation régulière avant les semis.'}
                      {humidite === 'moyen'  && 'Humidité correcte → Conditions favorables pour la majorité des cultures.'}
                      {humidite === 'eleve'  && 'Sol gorgé → Travaillez le drainage avant de planter pour éviter la pourriture.'}
                    </div>
                  </div>
                )}
              </Card>

              {/* Recommandations IA */}
              <Card style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '1rem', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '1.2rem' }}>🤖</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem' }}>Recommandations de l'IA</div>
                    <div style={{ fontFamily: F, fontSize: '0.72rem', color: '#9ca3af' }}>Basées sur votre sol, votre saison et votre localité</div>
                  </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#022c22,#064e3b)', borderRadius: '1.5rem', padding: '2rem' }}>
                  <pre style={{ fontFamily: F, fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
                    {result}
                  </pre>
                </div>

                {/* Alertes rapides */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1.5rem' }}>
                  {[
                    { ok: solData!.N >= 75, icon: '🌿', label: 'Azote', msg: solData!.N >= 75 ? 'Niveau satisfaisant' : 'Amendement azoté recommandé (urée ou compost)' },
                    { ok: solData!.P >= 65, icon: '⚡', label: 'Phosphore', msg: solData!.P >= 65 ? 'Niveau satisfaisant' : 'Appliquez de la cendre de bois ou du superphosphate' },
                    { ok: solData!.K >= 70, icon: '💪', label: 'Potassium', msg: solData!.K >= 70 ? 'Niveau satisfaisant' : 'Ajoutez du chlorure de potassium ou de la cendre' },
                    { ok: phVal >= 5.5 && phVal <= 7.5, icon: '⚖️', label: 'pH', msg: phVal >= 5.5 && phVal <= 7.5 ? 'pH dans la plage optimale' : phVal < 5.5 ? 'Chaulage recommandé pour corriger l\'acidité' : 'Sol trop alcalin : soufre agricole conseillé' },
                  ].map((a, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.7rem', padding: '1rem', borderRadius: '1rem', background: a.ok ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${a.ok ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}` }}>
                      {a.ok ? <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '0.1rem' }} /> : <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.1rem' }} />}
                      <div>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.78rem' }}>{a.icon} {a.label}</div>
                        <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem', lineHeight: 1.4 }}>{a.msg}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
