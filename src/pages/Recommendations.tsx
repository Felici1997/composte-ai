import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocationContext } from '@/contexts/LocationContext';
import { LocationSelector } from '@/components/LocationSelector';
import { supabase } from '@/integrations/supabase/client';
import { openAIService } from '@/services/openai';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin, Sprout, Droplets, CloudSun, TrendingUp,
  Loader2, ChevronRight, CheckCircle, AlertTriangle,
  BarChart3, Calendar, Thermometer, Star
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

/* ─── CULTURES DU CONGO ─── */
const CONGO_CROPS = [
  { name: 'Manioc',          icon: '🌿', soil: 'sableux/ferralitique', saison: 'toute saison', eau: 'faible',  profit: 180000, rendement: '15-25 t/ha', categorie: 'Tubercule' },
  { name: 'Maïs',            icon: '🌽', soil: 'limoneux/argileux',    saison: 'pluies',       eau: 'moyen',  profit: 120000, rendement: '3-6 t/ha',   categorie: 'Céréale' },
  { name: 'Banane plantain', icon: '🍌', soil: 'ferralitique riche',   saison: 'toute saison', eau: 'moyen',  profit: 250000, rendement: '20-35 t/ha', categorie: 'Fruit' },
  { name: 'Arachides',       icon: '🥜', soil: 'sableux/limoneux',     saison: 'grande saison sèche', eau: 'faible', profit: 200000, rendement: '1-3 t/ha', categorie: 'Légumineuse' },
  { name: 'Cacao',           icon: '🍫', soil: 'ferralitique humide',  saison: 'toute saison', eau: 'élevé',  profit: 800000, rendement: '0.5-2 t/ha', categorie: 'Cash crop' },
  { name: 'Café',            icon: '☕', soil: 'ferralitique',         saison: 'toute saison', eau: 'moyen',  profit: 600000, rendement: '0.5-1.5 t/ha', categorie: 'Cash crop' },
  { name: 'Palmier à huile', icon: '🌴', soil: 'argileux/humide',      saison: 'toute saison', eau: 'élevé',  profit: 450000, rendement: '4-10 t/ha',  categorie: 'Oléagineux' },
  { name: 'Igname',          icon: '🍠', soil: 'sableux profond',      saison: 'grande pluie', eau: 'moyen',  profit: 160000, rendement: '10-20 t/ha', categorie: 'Tubercule' },
  { name: 'Canne à sucre',   icon: '🎋', soil: 'limoneux fertile',     saison: 'toute saison', eau: 'élevé',  profit: 100000, rendement: '60-80 t/ha', categorie: 'Industriel' },
  { name: 'Légumes feuilles',icon: '🥬', soil: 'limoneux riche',       saison: 'saison sèche', eau: 'élevé',  profit: 300000, rendement: '5-15 t/ha',  categorie: 'Maraîchage' },
];

const SAISONS = [
  { val: 'grande-pluie',  label: 'Grande saison des pluies', mois: 'Oct — Déc', icon: '🌧️' },
  { val: 'petite-pluie',  label: 'Petite saison des pluies', mois: 'Mar — Mai', icon: '🌦️' },
  { val: 'grande-seche',  label: 'Grande saison sèche',      mois: 'Jun — Sep', icon: '☀️' },
  { val: 'petite-seche',  label: 'Petite saison sèche',      mois: 'Jan — Fév', icon: '🌤️' },
];

const SOLS = [
  { val: 'ferralitique', label: 'Ferralitique',  desc: 'Sol rouge, acide, typique du Congo', icon: '🟥' },
  { val: 'sableux',      label: 'Sableux',        desc: 'Sol léger, bien drainé', icon: '🏖️' },
  { val: 'argileux',     label: 'Argileux',       desc: 'Sol lourd, retient l\'eau', icon: '🧱' },
  { val: 'limoneux',     label: 'Limoneux',       desc: 'Sol fertile, équilibré', icon: '🌱' },
  { val: 'latéritique',  label: 'Latéritique',    desc: 'Sol cuirassé, zones savanes', icon: '🟤' },
];

const BUDGETS = [
  { val: 50000,   label: '< 50 000 FCFA',    icon: '🌱' },
  { val: 150000,  label: '50 000 – 150 000', icon: '🌿' },
  { val: 500000,  label: '150 000 – 500 000',icon: '🌳' },
  { val: 9999999, label: '> 500 000 FCFA',   icon: '🏆' },
];

/* ─── ALGO DE RECOMMANDATION LOCAL ─── */
function computeRecs(location: string, sol: string, saison: string, budget: number, crops: string[]) {
  return CONGO_CROPS
    .filter(c => budget === 0 || c.profit <= budget * 3)
    .filter(c => crops.length === 0 || crops.includes(c.name))
    .map(c => {
      let score = 70;
      if (c.soil.includes(sol)) score += 20;
      if (c.saison === 'toute saison') score += 8;
      else if (c.saison.includes(saison)) score += 15;
      score = Math.min(99, score + Math.floor(Math.random() * 5));
      return { ...c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}

/* ─── PAGE ─── */
export default function Recommendations() {
  const { selectedLocationName, setLocation, hasLocation, primaryCrops, soilTypes, bestSeasons } = useLocationContext();
  const [user, setUser] = useState<User | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Formulaire
  const [sol, setSol]       = useState('');
  const [saison, setSaison] = useState('');
  const [budget, setBudget] = useState(0);
  const [choix, setChoix]   = useState<string[]>([]);

  // Résultats
  const [results, setResults]   = useState<any[]>([]);
  const [aiText, setAiText]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState<'form'|'results'>('form');
  const [selected, setSelected] = useState<any | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
  }, []);

  // Pré-remplir depuis la BDD localisation
  useEffect(() => {
    if (soilTypes.length > 0 && !sol) setSol(soilTypes[0].toLowerCase().split(' ')[0]);
    if (bestSeasons.length > 0 && !saison) {
      const s = bestSeasons[0].toLowerCase();
      if (s.includes('pluie')) setSaison('grande-pluie');
      else if (s.includes('sèche') || s.includes('seche')) setSaison('grande-seche');
    }
  }, [soilTypes, bestSeasons]);

  const handleAnalyze = async () => {
    if (!hasLocation) { toast({ title: 'Localité requise', description: 'Sélectionnez votre zone avant de continuer.', variant: 'destructive' }); return; }
    if (!sol)         { toast({ title: 'Type de sol requis', variant: 'destructive' }); return; }
    if (!saison)      { toast({ title: 'Saison requise', variant: 'destructive' }); return; }

    setLoading(true);
    const recs = computeRecs(selectedLocationName, sol, saison, budget, choix);
    setResults(recs);

    try {
      const saisonLabel = SAISONS.find(s => s.val === saison)?.label || saison;
      const txt = await openAIService.generateCropRecommendation(sol, saisonLabel, selectedLocationName, budget || undefined);
      setAiText(txt);
    } catch { setAiText(''); }

    // Sauvegarder si connecté
    if (user) {
      await supabase.from('crop_recommendations').insert({
        user_id: user.id,
        soil_type: sol,
        recommended_crops: recs.map(r => ({
          crop_name: r.name,
          suitability_score: r.score,
          yield_prediction: parseFloat(r.rendement.split('-')[0]) || 5,
          profit_estimate: r.profit,
          benefits: [`Culture adaptée au ${sol}`, `${r.saison}`],
          risk_factors: ['Dépendance météo', 'Marché fluctuant'],
        }))
      }).throwOnError().catch(() => {});
    }

    setLoading(false);
    setStep('results');
  };

  const formatFCFA = (n: number) =>
    n >= 1000000 ? `${(n/1000000).toFixed(1)}M FCFA` : `${Math.round(n/1000)}K FCFA`;

  const scoreColor = (s: number) => s >= 90 ? '#10b981' : s >= 75 ? '#a38a5e' : '#6b7280';

  /* ── Selector toggle ── */
  const Selector = () => showSelector ? (
    <div className="rounded-3xl overflow-hidden border mb-6" style={{ borderColor: 'rgba(6,78,59,0.1)', boxShadow: '0 8px 40px rgba(6,78,59,0.06)' }}>
      <LocationSelector
        selectedLocation={selectedLocationName}
        onLocationChange={(n, c, d) => { setLocation(n, c, d); setShowSelector(false); }}
        showWeather={false}
      />
    </div>
  ) : null;

  /* ── RENDER ── */
  return (
    <div className="min-h-screen" style={{ background: '#f9f6f0', fontFamily: F }}>

      {/* ── EN-TÊTE ── */}
      <div
        className="relative pt-32 pb-20 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #022c22 0%, #064e3b 100%)' }}
      >
        <div className="absolute inset-0" style={{ background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', opacity: 0.04 }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
            style={{ fontFamily: F, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
            Intelligence Agricole
          </span>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'white', marginBottom: '1rem' }}>
            Cultures{' '}
            <span style={{ color: '#a38a5e', fontStyle: 'italic' }}>recommandées</span>
            <br />pour votre zone.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.8, fontFamily: F }}>
            L'IA analyse votre sol, votre saison et votre localité pour vous proposer les meilleures cultures au Congo.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {step === 'form' ? (
          <>
            {/* ── LOCALITÉ ── */}
            <SectionCard title="📍 Votre localité" subtitle="Les recommandations s'adaptent à votre zone">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  {hasLocation ? (
                    <div className="flex items-center gap-3">
                      <div className="icon-forest w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#064e3b' }}>
                        <MapPin size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b' }}>{selectedLocationName}</div>
                        {primaryCrops.length > 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: F }}>
                            Cultures connues : {primaryCrops.slice(0,3).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Aucune localité sélectionnée</p>
                  )}
                </div>
                <button
                  onClick={() => setShowSelector(!showSelector)}
                  className="btn-forest"
                  style={{ padding: '0.6rem 1.4rem', fontSize: '0.65rem' }}
                >
                  {hasLocation ? 'Changer' : 'Choisir ma localité'}
                </button>
              </div>
              {showSelector && (
                <div className="mt-4 rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(6,78,59,0.1)' }}>
                  <LocationSelector
                    selectedLocation={selectedLocationName}
                    onLocationChange={(n, c, d) => { setLocation(n, c, d); setShowSelector(false); }}
                    showWeather={false}
                  />
                </div>
              )}
            </SectionCard>

            {/* ── SOL ── */}
            <SectionCard title="🌍 Type de sol" subtitle="Quel sol avez-vous sur votre parcelle ?">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {SOLS.map(s => (
                  <button key={s.val} onClick={() => setSol(s.val)}
                    className="p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: sol === s.val ? '#064e3b' : 'white',
                      border: `2px solid ${sol === s.val ? '#064e3b' : 'rgba(6,78,59,0.1)'}`,
                      boxShadow: sol === s.val ? '0 4px 20px rgba(6,78,59,0.2)' : 'none',
                    }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.8rem', color: sol === s.val ? 'white' : '#064e3b' }}>{s.label}</div>
                    <div style={{ fontFamily: F, fontSize: '0.68rem', color: sol === s.val ? 'rgba(255,255,255,0.6)' : '#9ca3af', marginTop: 2 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── SAISON ── */}
            <SectionCard title="📅 Saison actuelle" subtitle="En quelle saison êtes-vous ?">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SAISONS.map(s => (
                  <button key={s.val} onClick={() => setSaison(s.val)}
                    className="p-4 rounded-2xl text-center transition-all"
                    style={{
                      background: saison === s.val ? '#a38a5e' : 'white',
                      border: `2px solid ${saison === s.val ? '#a38a5e' : 'rgba(163,138,94,0.15)'}`,
                      boxShadow: saison === s.val ? '0 4px 20px rgba(163,138,94,0.25)' : 'none',
                    }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{s.icon}</div>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.8rem', color: saison === s.val ? 'white' : '#064e3b' }}>{s.label}</div>
                    <div style={{ fontFamily: F, fontSize: '0.68rem', color: saison === s.val ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: 2 }}>{s.mois}</div>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── BUDGET ── */}
            <SectionCard title="💰 Budget disponible" subtitle="Pour les intrants et la préparation du champ">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BUDGETS.map(b => (
                  <button key={b.val} onClick={() => setBudget(b.val)}
                    className="p-4 rounded-2xl text-center transition-all"
                    style={{
                      background: budget === b.val ? '#064e3b' : 'white',
                      border: `2px solid ${budget === b.val ? '#064e3b' : 'rgba(6,78,59,0.1)'}`,
                    }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{b.icon}</div>
                    <div style={{ fontFamily: F, fontWeight: 600, fontSize: '0.75rem', color: budget === b.val ? 'white' : '#064e3b' }}>{b.label}</div>
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── CULTURES D'INTÉRÊT ── */}
            <SectionCard title="🌱 Cultures d'intérêt (optionnel)" subtitle="Sélectionnez les cultures qui vous intéressent">
              <div className="flex flex-wrap gap-2">
                {CONGO_CROPS.map(c => (
                  <button key={c.name}
                    onClick={() => setChoix(prev => prev.includes(c.name) ? prev.filter(x => x !== c.name) : [...prev, c.name])}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{
                      fontFamily: F,
                      background: choix.includes(c.name) ? '#064e3b' : 'white',
                      color: choix.includes(c.name) ? 'white' : '#064e3b',
                      border: `1.5px solid ${choix.includes(c.name) ? '#064e3b' : 'rgba(6,78,59,0.15)'}`,
                    }}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </SectionCard>

            {/* ── CTA ── */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full btn-argile flex items-center justify-center gap-3"
              style={{ padding: '1.2rem', fontSize: '0.8rem', borderRadius: '1.5rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Analyse en cours...</> : <><Sprout size={18} /> Obtenir mes recommandations</>}
            </button>
          </>
        ) : (
          /* ── RÉSULTATS ── */
          <>
            {/* Retour */}
            <button onClick={() => { setStep('form'); setSelected(null); }}
              className="flex items-center gap-2 mb-8 text-sm font-semibold"
              style={{ fontFamily: F, color: '#064e3b', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Modifier mes paramètres
            </button>

            {/* Résumé zone */}
            <div className="rounded-3xl p-6 mb-8 flex items-center gap-4"
              style={{ background: '#064e3b', boxShadow: '0 8px 40px rgba(6,78,59,0.15)' }}>
              <MapPin size={24} color="#10b981" />
              <div>
                <div style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{selectedLocationName}</div>
                <div style={{ fontFamily: F, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  Sol {SOLS.find(s => s.val === sol)?.label} · {SAISONS.find(s => s.val === saison)?.label}
                  {budget > 0 && ` · Budget ${formatFCFA(budget)}`}
                </div>
              </div>
            </div>

            {/* Grille cultures */}
            <h2 style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.8rem', color: '#064e3b', marginBottom: '1.5rem' }}>
              {results.length} cultures recommandées
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {results.map((r, i) => (
                <button key={i}
                  onClick={() => setSelected(selected?.name === r.name ? null : r)}
                  className="text-left rounded-3xl overflow-hidden transition-all"
                  style={{
                    background: 'white',
                    border: `2px solid ${selected?.name === r.name ? '#064e3b' : 'rgba(6,78,59,0.08)'}`,
                    boxShadow: selected?.name === r.name ? '0 8px 40px rgba(6,78,59,0.15)' : '0 2px 16px rgba(6,78,59,0.05)',
                    transform: selected?.name === r.name ? 'translateY(-2px)' : 'none',
                  }}>
                  {/* Score bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${scoreColor(r.score)} ${r.score}%, #e5e7eb ${r.score}%)` }} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: '2rem' }}>{r.icon}</span>
                        <div>
                          <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem' }}>{r.name}</div>
                          <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af' }}>{r.categorie}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.4rem', color: scoreColor(r.score) }}>{r.score}%</div>
                        <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af' }}>adéquation</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="rounded-xl p-3" style={{ background: '#f9f6f0' }}>
                        <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af' }}>Rendement</div>
                        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.85rem', color: '#064e3b' }}>{r.rendement}</div>
                      </div>
                      <div className="rounded-xl p-3" style={{ background: '#f9f6f0' }}>
                        <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af' }}>Revenu potentiel</div>
                        <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.85rem', color: '#a38a5e' }}>{formatFCFA(r.profit)}</div>
                      </div>
                    </div>

                    {selected?.name === r.name && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(6,78,59,0.08)' }}>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { icon: <Droplets size={12} />, txt: `Eau : ${r.eau}` },
                            { icon: <CloudSun size={12} />, txt: r.saison },
                            { icon: <Sprout size={12} />, txt: r.soil },
                          ].map((item, j) => (
                            <span key={j} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs"
                              style={{ fontFamily: F, background: 'rgba(6,78,59,0.06)', color: '#064e3b' }}>
                              {item.icon} {item.txt}
                            </span>
                          ))}
                        </div>
                        <Link to="/market">
                          <button className="w-full mt-3 btn-forest flex items-center justify-center gap-2"
                            style={{ padding: '0.7rem', fontSize: '0.65rem', borderRadius: '1rem' }}>
                            Voir les prix du marché <ChevronRight size={14} />
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Conseil IA */}
            {aiText && (
              <div className="rounded-3xl p-8" style={{ background: '#022c22', boxShadow: '0 8px 40px rgba(2,44,34,0.2)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#10b981' }}>
                    <Star size={18} color="white" />
                  </div>
                  <div style={{ fontFamily: FH, fontWeight: 800, color: 'white' }}>Conseil personnalisé de l'IA</div>
                </div>
                <pre style={{ fontFamily: F, fontSize: '0.87rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {aiText}
                </pre>
              </div>
            )}

            {/* Non connecté → incitation */}
            {!user && (
              <div className="mt-8 rounded-3xl p-8 text-center" style={{ background: 'white', border: '1px solid rgba(6,78,59,0.08)' }}>
                <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Sauvegardez vos recommandations
                </div>
                <p style={{ fontFamily: F, color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Créez un compte gratuit pour conserver l'historique de vos analyses.
                </p>
                <Link to="/auth">
                  <button className="btn-argile" style={{ padding: '0.9rem 2.5rem', fontSize: '0.7rem' }}>
                    Créer un compte
                  </button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── SECTION CARD ─── */
function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl p-6 sm:p-8 mb-5" style={{ background: 'white', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.04)' }}>
      <div className="mb-5">
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: 4 }}>{title}</h3>
        {subtitle && <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: '0.8rem', color: '#9ca3af' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
