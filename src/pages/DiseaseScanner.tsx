import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Camera, X, CheckCircle, AlertTriangle, Microscope, Zap } from 'lucide-react';
import { imageAnalyzer, getHealthStatusEmoji, getUrgencyColor } from '@/utils/imageAnalysis';
import type { User } from '@supabase/supabase-js';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

const URGENCY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: 'Faible',    color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  medium:   { label: 'Modéré',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  high:     { label: 'Élevé',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  critical: { label: 'Critique', color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
};

export default function DiseaseScanner() {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [cameraOn, setCameraOn] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadScans(session.user.id);
    });
  }, []);

  const loadScans = async (uid: string) => {
    const { data } = await supabase.from('disease_detections').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(4);
    setRecentScans(data || []);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setResult(null); setHealth(null); setProgress(0);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const startCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setCameraOn(true); }
    } catch { toast({ title: 'Caméra indisponible', variant: 'destructive' }); }
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
      const f = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setFile(f); setPreview(cv.toDataURL());
      stopCam();
    }, 'image/jpeg', 0.85);
  };

  const scan = async () => {
    if (!file) { toast({ title: 'Sélectionnez une image', variant: 'destructive' }); return; }
    setScanning(true); setProgress(0);
    const iv = setInterval(() => setProgress(p => p >= 85 ? (clearInterval(iv), 85) : p + Math.random() * 12), 150);
    try {
      const analysisResult = await imageAnalyzer.analyzeImage(file);
      setProgress(50);
      const healthAssessment = await imageAnalyzer.assessPlantHealth(analysisResult);
      setProgress(85);
      setResult(analysisResult); setHealth(healthAssessment);
      setProgress(100);
      if (user) {
        // ✅ CORRECTION : .throwOnError().catch() est invalide avec Supabase
        // On destructure { error } et on le gère manuellement
        const { error: insertError } = await supabase
          .from('disease_detections')
          .insert({
            user_id: user.id,
            disease_name: analysisResult.overallCondition,
            confidence_score: analysisResult.confidence,
            treatment_suggestion: healthAssessment.condition,
          });
        if (insertError) {
          console.warn('Erreur sauvegarde analyse:', insertError.message);
        }
        loadScans(user.id);
      }
    } catch (e: any) { toast({ title: 'Erreur d\'analyse', description: e.message, variant: 'destructive' }); }
    finally { clearInterval(iv); setScanning(false); }
  };

  const conditionFR: Record<string, string> = {
    healthy: 'Plante saine ✅', mild_damage: 'Légères anomalies', moderate_damage: 'Dommages modérés ⚠️', severe_damage: 'Dommages sévères ❗', critical: 'État critique 🚨'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f6f0', fontFamily: F }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#022c22 0%,#064e3b 100%)', paddingTop: '7rem', paddingBottom: '4rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <span style={{ display: 'inline-block', padding: '0.3rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', fontFamily: F, fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1rem' }}>Diagnostic IA</span>
          <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(2rem,5vw,3.5rem)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.05, marginBottom: '0.8rem' }}>
            Scanner de<br /><span style={{ color: '#a38a5e', fontStyle: 'italic' }}>maladies végétales.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', lineHeight: 1.8, maxWidth: '36rem' }}>
            Photographiez une feuille ou une plante malade. L'IA analyse les symptômes et propose un traitement adapté.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>

        {/* Zone upload */}
        <div>
          <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.05)', marginBottom: '1.2rem' }}>
            <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: '1.2rem' }}>📸 Charger une image</h2>

            {/* Caméra */}
            {cameraOn ? (
              <div style={{ position: 'relative', borderRadius: '1.2rem', overflow: 'hidden', marginBottom: '1rem' }}>
                <video ref={videoRef} style={{ width: '100%', display: 'block', borderRadius: '1.2rem' }} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                  <button onClick={capture} style={{ padding: '0.7rem 1.5rem', borderRadius: '2rem', background: '#064e3b', color: 'white', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>📷 Capturer</button>
                  <button onClick={stopCam} style={{ padding: '0.7rem 1.2rem', borderRadius: '2rem', background: 'rgba(220,38,38,0.9)', color: 'white', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ) : preview ? (
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <img src={preview} alt="plant" style={{ width: '100%', borderRadius: '1.2rem', objectFit: 'cover', maxHeight: '240px' }} />
                <button onClick={() => { setFile(null); setPreview(null); setResult(null); setHealth(null); }}
                  style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', color: 'white', display: 'flex' }}>
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(6,78,59,0.2)', borderRadius: '1.2rem', padding: '2.5rem', textAlign: 'center', cursor: 'pointer', background: '#f9f6f0', marginBottom: '1rem' }}>
                <Upload size={28} style={{ color: '#064e3b', margin: '0 auto 0.8rem' }} />
                <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', marginBottom: '0.3rem' }}>Déposez votre image</div>
                <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af' }}>JPG, PNG — Feuilles, tiges, fruits malades</div>
              </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => fileRef.current?.click()} style={{ flex: 1, padding: '0.8rem', borderRadius: '1.2rem', background: '#f9f6f0', border: '1.5px solid rgba(6,78,59,0.15)', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: '#064e3b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Upload size={14} /> Parcourir
              </button>
              <button onClick={startCam} style={{ flex: 1, padding: '0.8rem', borderRadius: '1.2rem', background: '#064e3b', border: 'none', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <Camera size={14} /> Caméra
              </button>
            </div>

            {file && !scanning && (
              <button onClick={scan} className="btn-argile" style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Zap size={15} /> Analyser avec l'IA
              </button>
            )}

            {scanning && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: F, fontSize: '0.75rem', color: '#064e3b', fontWeight: 600 }}>Analyse en cours…</span>
                  <span style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '0.85rem' }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: '#e5e7eb', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#064e3b,#10b981)', borderRadius: '3px', width: `${progress}%`, transition: 'width 0.2s' }} />
                </div>
              </div>
            )}
          </div>

          {/* Conseils photo */}
          <div style={{ background: 'white', borderRadius: '2rem', padding: '1.5rem', border: '1px solid rgba(6,78,59,0.07)' }}>
            <h3 style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem', marginBottom: '1rem' }}>📱 Conseils pour une bonne photo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { ok: true, txt: 'Gros plan sur les feuilles affectées' },
                { ok: true, txt: 'Bonne lumière naturelle' },
                { ok: true, txt: 'Image nette et sans flou' },
                { ok: false, txt: 'Évitez ombres et reflets' },
                { ok: false, txt: 'Pas d\'image trop sombre' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {c.ok ? <CheckCircle size={13} style={{ color: '#10b981', flexShrink: 0 }} /> : <AlertTriangle size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                  <span style={{ fontFamily: F, fontSize: '0.78rem', color: '#6b7280' }}>{c.txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résultats */}
        <div>
          {result && health ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Score santé */}
              <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                  <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem' }}>🔬 Résultat de l'analyse</h2>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '2rem', color: result.healthScore >= 70 ? '#10b981' : result.healthScore >= 40 ? '#f59e0b' : '#ef4444' }}>
                      {getHealthStatusEmoji(result.healthScore)} {result.healthScore}%
                    </div>
                    <div style={{ fontFamily: F, fontSize: '0.68rem', color: '#9ca3af' }}>Score santé</div>
                  </div>
                </div>

                <div style={{ padding: '1rem', borderRadius: '1.2rem', background: URGENCY_LABELS[health.urgency]?.bg || '#f9f6f0', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: URGENCY_LABELS[health.urgency]?.color || '#9ca3af', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem' }}>{conditionFR[result.overallCondition] || result.overallCondition}</div>
                    <div style={{ fontFamily: F, fontSize: '0.72rem', color: '#6b7280' }}>Urgence : {URGENCY_LABELS[health.urgency]?.label || health.urgency}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '0.75rem', marginBottom: '1.2rem' }}>
                  {[
                    { label: 'Taches noires', val: result.hasBlackSpots ? `${result.blackSpotCount} taches` : 'Aucune', warn: result.hasBlackSpots },
                    { label: 'Dommages', val: `${result.damagePercentage.toFixed(1)}%`, warn: result.damagePercentage > 10 },
                    { label: 'Qualité image', val: `${result.imageQuality.toFixed(0)}%`, warn: false },
                    { label: 'Confiance IA', val: `${result.confidence.toFixed(1)}%`, warn: false },
                  ].map((s, i) => (
                    <div key={i} style={{ borderRadius: '1rem', padding: '0.9rem', background: '#f9f6f0' }}>
                      <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                      <div style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.1rem', color: s.warn ? '#ef4444' : '#064e3b', marginTop: '0.2rem' }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Recommandations */}
                <div style={{ borderTop: '1px solid rgba(6,78,59,0.08)', paddingTop: '1.2rem' }}>
                  <h3 style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem', marginBottom: '0.8rem' }}>💡 Recommandations</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {health.recommendations.map((r: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                        <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>→</span>
                        <span style={{ fontFamily: F, fontSize: '0.8rem', color: '#374151', lineHeight: 1.6 }}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues détectées */}
                {result.detectedIssues?.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(6,78,59,0.08)', paddingTop: '1.2rem', marginTop: '1rem' }}>
                    <h3 style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem', marginBottom: '0.8rem' }}>⚠️ Problèmes détectés</h3>
                    {result.detectedIssues.map((iss: string, i: number) => (
                      <div key={i} style={{ fontFamily: F, fontSize: '0.78rem', color: '#6b7280', padding: '0.4rem 0', borderBottom: '1px solid rgba(6,78,59,0.06)' }}>• {iss}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Scans récents */
            <div style={{ background: 'white', borderRadius: '2rem', padding: '2rem', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.05)' }}>
              <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                {recentScans.length ? '🕘 Analyses récentes' : '📋 Comment ça marche'}
              </h2>
              {recentScans.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {recentScans.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1.2rem', background: '#f9f6f0' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '0.8rem', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Microscope size={16} color="white" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem' }}>{s.disease_name?.replace('_', ' ') || 'Analyse'}</div>
                        <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(s.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.8rem', color: '#10b981' }}>{s.confidence_score?.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    { n: '1', t: 'Chargez une photo', d: 'Téléchargez ou prenez une photo de la plante malade' },
                    { n: '2', t: 'Analyse IA', d: 'Notre IA analyse les symptômes visuels en quelques secondes' },
                    { n: '3', t: 'Traitement', d: 'Recevez un diagnostic et les traitements recommandés' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '1.2rem', background: '#f9f6f0' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '0.7rem', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontFamily: FH, fontWeight: 800, color: 'white', fontSize: '0.8rem' }}>{s.n}</span>
                      </div>
                      <div>
                        <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.88rem', marginBottom: '0.2rem' }}>{s.t}</div>
                        <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.5 }}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
