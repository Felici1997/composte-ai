import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { callAI } from '@/services/aiProvider';
import AIProviderSelector from '@/components/AIProviderSelector';
import {
  Loader2, Upload, Camera, X, CheckCircle, AlertTriangle,
  Microscope, Zap, ChevronDown, ChevronUp, Leaf,
  FlaskConical, ShieldCheck, Clock, BarChart2, RefreshCw
} from 'lucide-react';
import { imageAnalyzer } from '@/utils/imageAnalysis';
import type { User } from '@supabase/supabase-js';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

interface AIDiagnosis {
  disease_name:    string;
  disease_type:    'fongique' | 'bacterien' | 'viral' | 'carence' | 'ravageur' | 'sain';
  latin_name?:     string;
  confidence_ai:   number;
  severity:        'sain' | 'leger' | 'modere' | 'severe' | 'critique';
  affected_parts:  string[];
  symptoms:        string[];
  causes:          string[];
  treatments: {
    immediate:  string[];
    chemical:   { product: string; dose: string; frequency: string }[];
    biological: string[];
    preventive: string[];
  };
  best_practices:  string[];
  timeline:        { label: string; action: string }[];
  risk_spread:     'faible' | 'modere' | 'eleve';
  economic_impact: string;
  consult_expert:  boolean;
}

const SEV: Record<string, { color: string; bg: string; border: string; label: string; icon: string }> = {
  sain:     { color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0', label: 'Plante saine', icon: 'OK' },
  leger:    { color: '#84cc16', bg: '#f7fee7', border: '#d9f99d', label: 'Leger',        icon: 'L'  },
  modere:   { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Modere',       icon: 'M'  },
  severe:   { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Severe',       icon: 'S'  },
  critique: { color: '#dc2626', bg: '#fff1f2', border: '#fca5a5', label: 'Critique',     icon: '!'  },
};

const TYPE_META: Record<string, { color: string; bg: string; label: string }> = {
  fongique:  { color: '#8b5cf6', bg: '#f5f3ff', label: 'Fongique'   },
  bacterien: { color: '#ef4444', bg: '#fef2f2', label: 'Bacterien'  },
  viral:     { color: '#f97316', bg: '#fff7ed', label: 'Viral'      },
  carence:   { color: '#f59e0b', bg: '#fffbeb', label: 'Carence'    },
  ravageur:  { color: '#dc2626', bg: '#fef2f2', label: 'Ravageur'   },
  sain:      { color: '#10b981', bg: '#f0fdf4', label: 'Sain'       },
};

function Section({ title, children, open: defaultOpen = true }: {
  title: string; children: React.ReactNode; open?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'white', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 16px rgba(6,78,59,0.04)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '0.92rem' }}>{title}</span>
        {open ? <ChevronUp size={15} color="#9ca3af" /> : <ChevronDown size={15} color="#9ca3af" />}
      </button>
      {open && <div style={{ padding: '0 1.4rem 1.4rem' }}>{children}</div>}
    </div>
  );
}

function Tag({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ display: 'inline-block', padding: '0.22rem 0.7rem', borderRadius: '2rem', background: bg, fontFamily: F, fontSize: '0.7rem', fontWeight: 600, color, whiteSpace: 'nowrap' as const }}>
      {text}
    </span>
  );
}

export default function DiseaseScanner() {
  const [user, setUser]               = useState<User | null>(null);
  const [file, setFile]               = useState<File | null>(null);
  const [preview, setPreview]         = useState<string | null>(null);
  const [scanning, setScanning]       = useState(false);
  const [progress, setProgress]       = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [rawResult, setRawResult]     = useState<any>(null);
  const [diagnosis, setDiagnosis]     = useState<AIDiagnosis | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [cameraOn, setCameraOn]       = useState(false);
  const [tab, setTab]                 = useState<'treatment' | 'timeline' | 'practices'>('treatment');

  const fileRef   = useRef<HTMLInputElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadScans(session.user.id);
    });
  }, []);

  const loadScans = async (uid: string) => {
    const { data } = await supabase.from('disease_detections')
      .select('*').eq('user_id', uid)
      .order('created_at', { ascending: false }).limit(5);
    setRecentScans(data || []);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setRawResult(null); setDiagnosis(null); setProgress(0);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setCameraOn(true); }
    } catch { toast({ title: 'Camera indisponible', variant: 'destructive' }); }
  };

  const stopCam = () => {
    if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    setCameraOn(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const cv = canvasRef.current, vd = videoRef.current;
    cv.width = vd.videoWidth; cv.height = vd.videoHeight;
    cv.getContext('2d')?.drawImage(vd, 0, 0);
    cv.toBlob(blob => {
      if (!blob) return;
      setFile(new File([blob], 'capture.jpg', { type: 'image/jpeg' }));
      setPreview(cv.toDataURL());
      stopCam();
    }, 'image/jpeg', 0.85);
  };

  const scan = async () => {
    if (!file) { toast({ title: 'Selectionnez une image', variant: 'destructive' }); return; }
    setScanning(true); setProgress(0); setProgressLabel('Chargement...');
    try {
      setProgressLabel('Analyse visuelle des pixels...'); setProgress(15);
      const raw = await imageAnalyzer.analyzeImage(file);
      setRawResult(raw); setProgress(40);

      setProgressLabel('Consultation de l\'IA...'); setProgress(55);
      const prompt = `Tu es phytopathologiste expert Congo Brazzaville. Analyse ces donnees de scan et genere un diagnostic JSON:
Score sante: ${raw.healthScore}/100, Condition: ${raw.overallCondition}, Problemes: ${raw.detectedIssues.join(', ') || 'aucun'}, Dommages: ${raw.damagePercentage.toFixed(1)}%, Taches noires: ${raw.hasBlackSpots ? raw.blackSpotCount + ' taches' : 'non'}.

Reponds UNIQUEMENT avec ce JSON valide (sans markdown):
{"disease_name":"Nom FR","disease_type":"fongique|bacterien|viral|carence|ravageur|sain","latin_name":"Nom latin","confidence_ai":85,"severity":"sain|leger|modere|severe|critique","affected_parts":["feuilles"],"symptoms":["symptome1","symptome2","symptome3"],"causes":["cause1","cause2"],"treatments":{"immediate":["action1","action2"],"chemical":[{"product":"Produit","dose":"2ml/L","frequency":"1x/semaine"}],"biological":["bio1","bio2"],"preventive":["prev1","prev2"]},"best_practices":["pratique1","pratique2","pratique3"],"timeline":[{"label":"Jour 1-3","action":"action urgente"},{"label":"Semaine 1","action":"suivi"},{"label":"Semaine 2-4","action":"reevaluation"}],"risk_spread":"faible|modere|eleve","economic_impact":"description courte","consult_expert":false}`;

      const aiText = await callAI(prompt, 1500);
      setProgress(85); setProgressLabel('Generation du rapport...');

      let diag: AIDiagnosis | null = null;
      if (aiText) {
        try {
          const match = aiText.match(/\{[\s\S]*\}/);
          if (match) diag = JSON.parse(match[0]);
        } catch { /* fallback */ }
      }
      if (!diag) diag = makeFallback(raw);

      setDiagnosis(diag); setProgress(100); setProgressLabel('Analyse terminee !');

      if (user) {
        await supabase.from('disease_detections').insert({
          user_id:                  user.id,
          crop_name:                'Indeterminee',
          detected_disease:         diag.disease_name,
          confidence_score:         diag.confidence_ai / 100,
          treatment_recommendations: diag.treatments.immediate,
          severity:                 diag.severity,
        }).throwOnError().catch(() => {});
        loadScans(user.id);
      }
    } catch (e: any) {
      toast({ title: 'Erreur analyse', description: e.message, variant: 'destructive' });
    } finally {
      setTimeout(() => setScanning(false), 400);
    }
  };

  function makeFallback(raw: any): AIDiagnosis {
    const sev = raw.healthScore >= 80 ? 'sain' : raw.healthScore >= 60 ? 'leger' : raw.healthScore >= 40 ? 'modere' : raw.healthScore >= 20 ? 'severe' : 'critique';
    return {
      disease_name:    sev === 'sain' ? 'Plante en bonne sante' : raw.detectedIssues[0] || 'Anomalie detectee',
      disease_type:    sev === 'sain' ? 'sain' : raw.hasBlackSpots ? 'fongique' : 'bacterien',
      confidence_ai:   Math.round(raw.confidence),
      severity:        sev,
      affected_parts:  raw.hasBlackSpots ? ['feuilles'] : ['plante entiere'],
      symptoms:        raw.detectedIssues.length ? raw.detectedIssues.slice(0, 3) : ['Aucun symptome visible'],
      causes:          ['Conditions climatiques (humidite, temperature)', 'Carences nutritives du sol', 'Contamination depuis plantes voisines'],
      treatments: {
        immediate:  sev === 'sain' ? ['Continuer les soins habituels', 'Surveillance preventive'] : ['Isoler la plante affectee', 'Retirer les parties tres endommagees'],
        chemical:   sev !== 'sain' ? [{ product: 'Fongicide cuivrique (Bordeaux)', dose: '3g/L', frequency: '1x par semaine' }] : [],
        biological: ['Decoction de neem (5ml/L)', 'Bicarbonate de soude (1g/L)', 'Purin d\'ail dilue (10ml/L)'],
        preventive: ['Arroser le matin uniquement', 'Assurer bonne aeration entre plants', 'Rotation des cultures recommandee'],
      },
      best_practices:  [
        'Inspecter visuellement les plantes 2 fois par semaine',
        'Eviter l\'arrosage foliaire en soiree pour reduire humidite',
        'Nettoyer et desinfecter les outils entre chaque utilisation',
        'Maintenir un espace adequat entre les plants pour l\'aeration',
      ],
      timeline: [
        { label: 'Aujourd\'hui',  action: 'Inspecter toutes les plantes du meme rang et isoler si necessaire' },
        { label: 'Jours 3-5',     action: 'Appliquer le premier traitement et observer evolution des symptomes' },
        { label: 'Semaine 2',     action: 'Reevaluer et ajuster le traitement selon la reponse de la plante' },
      ],
      risk_spread:     raw.damagePercentage > 20 ? 'eleve' : raw.damagePercentage > 5 ? 'modere' : 'faible',
      economic_impact: 'Ajoutez une cle IA (OpenAI/Gemini/Anthropic) pour un diagnostic economique precis.',
      consult_expert:  raw.healthScore < 30,
    };
  }

  const reset = () => { setFile(null); setPreview(null); setRawResult(null); setDiagnosis(null); setProgress(0); };
  const sev = diagnosis ? (SEV[diagnosis.severity] || SEV.modere) : null;
  const typeMeta = diagnosis ? (TYPE_META[diagnosis.disease_type] || TYPE_META.fongique) : null;

  const riskColor = (risk: string) => risk === 'eleve' ? '#ef4444' : risk === 'modere' ? '#f59e0b' : '#10b981';

  return (
    <div style={{ minHeight: '100vh', background: '#f9f6f0', fontFamily: F }}>

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(160deg,#022c22 0%,#064e3b 100%)', paddingTop: '7rem', paddingBottom: '3.5rem', padding: '7rem 1.5rem 3.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' as const, letterSpacing: '0.25em', marginBottom: '1rem' }}>
                Diagnostic IA
              </span>
              <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(1.8rem,5vw,3.2rem)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: '0.7rem' }}>
                Scanner de<br /><span style={{ color: '#a38a5e', fontStyle: 'italic' }}>maladies vegetales.</span>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.8, maxWidth: '34rem' }}>
                Photo → Analyse IA → Diagnostic complet : maladie, causes, traitements, calendrier et bonnes pratiques.
              </p>
            </div>
            <div style={{ alignSelf: 'flex-end', paddingBottom: '0.5rem' }}>
              <AIProviderSelector />
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

          {/* ══ GAUCHE : Upload + conseils ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 16px rgba(6,78,59,0.04)' }}>
              <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '0.98rem', marginBottom: '1.1rem' }}>Image a analyser</h2>

              {cameraOn ? (
                <div style={{ position: 'relative', borderRadius: '1.2rem', overflow: 'hidden', marginBottom: '1rem' }}>
                  <video ref={videoRef} style={{ width: '100%', display: 'block' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.6rem' }}>
                    <button onClick={capture} style={{ padding: '0.65rem 1.3rem', borderRadius: '2rem', background: '#064e3b', color: 'white', fontFamily: F, fontSize: '0.7rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Capturer</button>
                    <button onClick={stopCam} style={{ padding: '0.65rem 0.9rem', borderRadius: '2rem', background: 'rgba(220,38,38,0.9)', color: 'white', border: 'none', cursor: 'pointer' }}><X size={13} /></button>
                  </div>
                </div>
              ) : preview ? (
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                  <img src={preview} alt="plant" style={{ width: '100%', borderRadius: '1.2rem', objectFit: 'cover', maxHeight: '220px' }} />
                  <button onClick={reset} style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', color: 'white', display: 'flex' }}>
                    <X size={13} />
                  </button>
                  {sev && (
                    <div style={{ position: 'absolute', bottom: '0.6rem', left: '0.6rem', padding: '0.25rem 0.7rem', borderRadius: '2rem', background: sev.bg, border: `1px solid ${sev.border}`, fontFamily: F, fontSize: '0.62rem', fontWeight: 700, color: sev.color }}>
                      {sev.label}
                    </div>
                  )}
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(6,78,59,0.2)', borderRadius: '1.2rem', padding: '2.5rem 1rem', textAlign: 'center', cursor: 'pointer', background: '#f9f6f0', marginBottom: '1rem' }}>
                  <Upload size={26} style={{ color: '#064e3b', margin: '0 auto 0.7rem' }} />
                  <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', marginBottom: '0.3rem', fontSize: '0.88rem' }}>Deposez une image</div>
                  <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af' }}>Feuilles, tiges, fruits maladies</div>
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '0.72rem', borderRadius: '1rem', background: '#f9f6f0', border: '1.5px solid rgba(6,78,59,0.12)', fontFamily: F, fontSize: '0.68rem', fontWeight: 700, color: '#064e3b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Upload size={12} /> Fichier
                </button>
                <button onClick={startCam} style={{ flex: 1, padding: '0.72rem', borderRadius: '1rem', background: '#064e3b', border: 'none', fontFamily: F, fontSize: '0.68rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <Camera size={12} /> Camera
                </button>
              </div>

              {file && !diagnosis && !scanning && (
                <button onClick={scan} style={{ width: '100%', marginTop: '0.8rem', padding: '1rem', borderRadius: '1.2rem', background: 'linear-gradient(135deg,#a38a5e,#8b7355)', border: 'none', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 16px rgba(163,138,94,0.3)' }}>
                  <Zap size={14} /> Lancer le diagnostic IA
                </button>
              )}

              {diagnosis && (
                <button onClick={reset} style={{ width: '100%', marginTop: '0.8rem', padding: '0.8rem', borderRadius: '1.2rem', background: '#f9f6f0', border: '1.5px solid rgba(6,78,59,0.12)', fontFamily: F, fontSize: '0.68rem', fontWeight: 700, color: '#064e3b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <RefreshCw size={12} /> Nouveau scan
                </button>
              )}

              {scanning && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontFamily: F, fontSize: '0.7rem', color: '#064e3b', fontWeight: 600 }}>{progressLabel}</span>
                    <span style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '0.78rem' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '3px', background: '#e5e7eb', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#064e3b,#10b981)', borderRadius: '3px', width: `${progress}%`, transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.8rem' }}>
                    <Loader2 size={18} style={{ color: '#064e3b', animation: 'spin 1s linear infinite' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Conseils photo */}
            <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(6,78,59,0.07)' }}>
              <h3 style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.9rem' }}>Conseils pour une bonne photo</h3>
              {[
                { ok: true,  txt: 'Gros plan sur la zone affectee (5-15 cm)' },
                { ok: true,  txt: 'Lumiere naturelle, pas de flash' },
                { ok: true,  txt: 'Photographier recto et verso de la feuille' },
                { ok: true,  txt: 'Inclure la tige si elle est touchee' },
                { ok: false, txt: 'Eviter les ombres et le flou' },
                { ok: false, txt: 'Pas d\'image trop sombre' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', padding: '0.28rem 0' }}>
                  {c.ok ? <CheckCircle size={12} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} /> : <AlertTriangle size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />}
                  <span style={{ fontFamily: F, fontSize: '0.73rem', color: '#6b7280', lineHeight: 1.5 }}>{c.txt}</span>
                </div>
              ))}
            </div>

            {/* Historique */}
            {recentScans.length > 0 && !diagnosis && (
              <div style={{ background: 'white', borderRadius: '1.5rem', padding: '1.4rem', border: '1px solid rgba(6,78,59,0.07)' }}>
                <h3 style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.9rem' }}>Historique</h3>
                {recentScans.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', borderRadius: '0.9rem', background: '#f9f6f0', marginBottom: '0.5rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '0.6rem', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Microscope size={13} color="white" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: F, fontWeight: 600, color: '#064e3b', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                        {s.detected_disease || 'Analyse'}
                      </div>
                      <div style={{ fontFamily: F, fontSize: '0.62rem', color: '#9ca3af' }}>
                        {new Date(s.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </div>
                    </div>
                    <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.72rem', color: '#10b981' }}>
                      {s.confidence_score ? Math.round(s.confidence_score * 100) + '%' : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══ DROITE : Résultats ══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            {diagnosis && rawResult ? (
              <>
                {/* Carte diagnostic principale */}
                <div style={{ background: sev?.bg || 'white', borderRadius: '1.5rem', padding: '1.5rem', border: `2px solid ${sev?.border || '#e5e7eb'}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div style={{ width: '68px', height: '68px', borderRadius: '1.1rem', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `2px solid ${sev?.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                      <span style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.4rem', color: sev?.color, lineHeight: 1 }}>{rawResult.healthScore}</span>
                      <span style={{ fontFamily: F, fontSize: '0.52rem', color: '#9ca3af', marginTop: '0.1rem' }}>/ 100</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: FH, fontWeight: 900, color: '#064e3b', fontSize: '1rem', marginBottom: '0.25rem', lineHeight: 1.2 }}>
                        {diagnosis.disease_name}
                      </div>
                      {diagnosis.latin_name && (
                        <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: '0.4rem' }}>{diagnosis.latin_name}</div>
                      )}
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' as const }}>
                        <Tag text={sev?.label || ''} color={sev?.color || ''} bg="white" />
                        <Tag text={typeMeta?.label || ''} color={typeMeta?.color || ''} bg="white" />
                        <Tag text={`IA ${diagnosis.confidence_ai}%`} color="#6b7280" bg="white" />
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem' }}>
                    {[
                      { icon: <BarChart2 size={13} />, label: 'Dommages',    val: `${rawResult.damagePercentage.toFixed(0)}%`,  color: rawResult.damagePercentage > 20 ? '#ef4444' : '#064e3b' },
                      { icon: <ShieldCheck size={13} />, label: 'Risque',     val: diagnosis.risk_spread,                         color: riskColor(diagnosis.risk_spread) },
                      { icon: <Microscope size={13} />, label: 'Confiance',  val: `${rawResult.confidence.toFixed(0)}%`,          color: '#064e3b' },
                    ].map((m, i) => (
                      <div key={i} style={{ background: 'white', borderRadius: '0.9rem', padding: '0.7rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', color: m.color, marginBottom: '0.25rem' }}>{m.icon}</div>
                        <div style={{ fontFamily: FH, fontWeight: 800, fontSize: '0.85rem', color: m.color }}>{m.val}</div>
                        <div style={{ fontFamily: F, fontSize: '0.58rem', color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {diagnosis.consult_expert && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.9rem', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                      <AlertTriangle size={15} style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
                      <span style={{ fontFamily: F, fontSize: '0.73rem', color: '#dc2626', fontWeight: 600, lineHeight: 1.5 }}>
                        Cas severe — Consultation d\'un agronome recommandee au plus vite.
                      </span>
                    </div>
                  )}
                </div>

                {/* Symptomes & Causes */}
                <Section title="Symptomes et causes identifies">
                  <div style={{ marginBottom: '1.1rem' }}>
                    <div style={{ fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Parties affectees</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.4rem', marginBottom: '1rem' }}>
                      {diagnosis.affected_parts.map((p, i) => <Tag key={i} text={p} color="#064e3b" bg="rgba(6,78,59,0.07)" />)}
                    </div>
                    <div style={{ fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Symptomes</div>
                    {diagnosis.symptoms.map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.35rem 0', borderBottom: i < diagnosis.symptoms.length - 1 ? '1px solid rgba(6,78,59,0.05)' : 'none' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 700, flexShrink: 0 }}>•</span>
                        <span style={{ fontFamily: F, fontSize: '0.77rem', color: '#374151', lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Causes</div>
                    {diagnosis.causes.map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.35rem 0', borderBottom: i < diagnosis.causes.length - 1 ? '1px solid rgba(6,78,59,0.05)' : 'none' }}>
                        <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>&#8594;</span>
                        <span style={{ fontFamily: F, fontSize: '0.77rem', color: '#374151', lineHeight: 1.5 }}>{c}</span>
                      </div>
                    ))}
                  </div>
                  {diagnosis.economic_impact && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: '0.9rem', background: '#fffbeb', border: '1px solid #fde68a' }}>
                      <span style={{ fontFamily: F, fontSize: '0.73rem', color: '#92400e' }}>
                        Impact economique : {diagnosis.economic_impact}
                      </span>
                    </div>
                  )}
                </Section>

                {/* Traitements */}
                <Section title="Traitements et interventions">
                  <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.1rem', overflowX: 'auto' as const, paddingBottom: '0.15rem' }}>
                    {([
                      { id: 'treatment', icon: <FlaskConical size={11} />, label: 'Chimique & Bio' },
                      { id: 'timeline',  icon: <Clock size={11} />,        label: 'Calendrier'    },
                      { id: 'practices', icon: <Leaf size={11} />,         label: 'Pratiques'     },
                    ] as const).map(t => (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.85rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' as const, fontFamily: F, fontSize: '0.67rem', fontWeight: 700,
                          background: tab === t.id ? '#064e3b' : '#f9f6f0',
                          color: tab === t.id ? 'white' : '#064e3b' }}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>

                  {tab === 'treatment' && (
                    <div>
                      {/* Immediate */}
                      <div style={{ padding: '0.8rem 1rem', borderRadius: '1rem', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', marginBottom: '1rem' }}>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Actions immediates</div>
                        {diagnosis.treatments.immediate.map((t, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0', fontFamily: F, fontSize: '0.76rem', color: '#374151' }}>
                            <span style={{ color: '#dc2626', fontWeight: 700, flexShrink: 0 }}>!</span> {t}
                          </div>
                        ))}
                      </div>

                      {/* Chemical */}
                      {diagnosis.treatments.chemical.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Traitements chimiques</div>
                          {diagnosis.treatments.chemical.map((tc, i) => (
                            <div key={i} style={{ borderRadius: '0.9rem', padding: '0.85rem 1rem', background: '#f9f6f0', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div>
                                <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.82rem' }}>{tc.product}</div>
                                <div style={{ fontFamily: F, fontSize: '0.67rem', color: '#6b7280', marginTop: '0.15rem' }}>{tc.frequency}</div>
                              </div>
                              <Tag text={tc.dose} color="#8b5cf6" bg="rgba(139,92,246,0.1)" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Biological */}
                      {diagnosis.treatments.biological.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Traitements biologiques</div>
                          {diagnosis.treatments.biological.map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.45rem 0.7rem', borderRadius: '0.7rem', background: '#f0fdf4', marginBottom: '0.35rem', fontFamily: F, fontSize: '0.75rem', color: '#166534' }}>
                              <span style={{ color: '#10b981', flexShrink: 0 }}>&#10003;</span> {t}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Preventive */}
                      {diagnosis.treatments.preventive.length > 0 && (
                        <div>
                          <div style={{ fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Mesures preventives</div>
                          {diagnosis.treatments.preventive.map((t, i) => (
                            <div key={i} style={{ display: 'flex', gap: '0.5rem', padding: '0.35rem 0', borderBottom: i < diagnosis.treatments.preventive.length - 1 ? '1px solid rgba(6,78,59,0.05)' : 'none', fontFamily: F, fontSize: '0.76rem', color: '#374151' }}>
                              <span style={{ color: '#064e3b', flexShrink: 0 }}>&#8594;</span> {t}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {tab === 'timeline' && (
                    <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                      <div style={{ position: 'absolute', left: '0.55rem', top: 0, bottom: 0, width: '2px', background: 'linear-gradient(#064e3b,#10b981)', borderRadius: '2px' }} />
                      {diagnosis.timeline.map((t, i) => (
                        <div key={i} style={{ position: 'relative', paddingBottom: '1.1rem' }}>
                          <div style={{ position: 'absolute', left: '-1.45rem', top: '3px', width: '11px', height: '11px', borderRadius: '50%', background: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#10b981', border: '2px solid white' }} />
                          <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>{t.label}</div>
                          <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>{t.action}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === 'practices' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {diagnosis.best_practices.map((bp, i) => (
                        <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '1rem', background: '#f9f6f0', alignItems: 'flex-start' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '0.55rem', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontFamily: FH, fontWeight: 800, color: 'white', fontSize: '0.68rem' }}>{i + 1}</span>
                          </div>
                          <span style={{ fontFamily: F, fontSize: '0.77rem', color: '#374151', lineHeight: 1.6 }}>{bp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </>

            ) : !scanning ? (
              /* Etat initial */
              <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem 1.5rem', border: '1px solid rgba(6,78,59,0.07)', textAlign: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '1.3rem', background: 'linear-gradient(135deg,#064e3b,#0a6644)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.1rem', fontSize: '1.8rem' }}>&#128300;</div>
                <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem', marginBottom: '0.4rem' }}>Pret pour le diagnostic</div>
                <div style={{ fontFamily: F, fontSize: '0.78rem', color: '#9ca3af', marginBottom: '1.8rem', lineHeight: 1.7 }}>
                  Chargez une photo et obtenez un diagnostic complet avec traitements et calendrier d\'intervention.
                </div>
                {[
                  { icon: '&#128269;', title: 'Detection visuelle',  desc: 'Analyse des taches, couleurs et lesions' },
                  { icon: '&#129302;', title: 'Diagnostic IA',       desc: 'Identification de la maladie et severite' },
                  { icon: '&#128138;', title: 'Plan de traitement',  desc: 'Chimique, biologique et preventif' },
                  { icon: '&#128203;', title: 'Bonnes pratiques',    desc: 'Conseils adaptes aux cultures tropicales' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: '1rem', background: '#f9f6f0', marginBottom: '0.5rem', textAlign: 'left' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: s.icon }} />
                    <div>
                      <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.8rem' }}>{s.title}</div>
                      <div style={{ fontFamily: F, fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.1rem' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
