import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLocationContext } from '@/contexts/LocationContext';
import { Sprout, Microscope, TrendingUp, CloudSun, MapPin, ChevronRight, Lightbulb, Calendar, Droplets, Clock } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

const QUICK = [
  { icon: <Sprout size={22} />, label: 'Recommandations', sub: 'Cultures adaptées à votre zone', to: '/recommendations', bg: '#064e3b', accent: '#10b981' },
  { icon: <Microscope size={22} />, label: 'Scanner maladies', sub: 'Analyser une feuille malade', to: '/disease-scanner', bg: '#7c2d12', accent: '#f97316' },
  { icon: <TrendingUp size={22} />, label: 'Marché', sub: 'Prix des cultures en FCFA', to: '/market', bg: '#1e3a5f', accent: '#60a5fa' },
  { icon: <CloudSun size={22} />, label: 'Météo agricole', sub: 'Prévisions pour votre zone', to: '/weather', bg: '#1a1a2e', accent: '#a78bfa' },
  { icon: <Lightbulb size={22} />, label: 'Assistant IA', sub: 'Posez vos questions en français', to: '/ai-assistant', bg: '#422006', accent: '#fbbf24' },
  { icon: <Droplets size={22} />, label: 'Analyse de sol', sub: 'Recommandations d\'engrais', to: '/soil-analysis', bg: '#1c4532', accent: '#6ee7b7' },
];

const TIPS = [
  { icon: '🌧️', title: 'Préparez la grande saison', body: 'En période de pluies, pensez à drainer vos parcelles basses pour éviter la pourriture des racines de manioc.' },
  { icon: '🌱', title: 'Rotation des cultures', body: 'Alterner légumineuses (arachides, niébé) avec les céréales régénère l\'azote du sol naturellement.' },
  { icon: '💧', title: 'Irrigation de la pépinière', body: 'Arrosez tôt le matin ou après 17h pour réduire l\'évaporation jusqu\'à 40%.' },
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ recs: 0, scans: 0 });
  const { selectedLocationName, hasLocation } = useLocationContext();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      loadData(session.user.id);
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate('/auth');
    });
  }, [navigate]);

  const loadData = async (uid: string) => {
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', uid).maybeSingle();
    setProfile(p);
    const [r, s] = await Promise.all([
      supabase.from('crop_recommendations').select('id', { count: 'exact' }).eq('user_id', uid),
      supabase.from('disease_detections').select('id', { count: 'exact' }).eq('user_id', uid),
    ]);
    setStats({ recs: r.count || 0, scans: s.count || 0 });
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Producteur';
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f9f6f0' }}>
      <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#064e3b', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: '#f9f6f0', fontFamily: F }}>

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden pt-28 pb-16 px-6"
        style={{ background: 'linear-gradient(160deg, #022c22 0%, #064e3b 100%)' }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", opacity: 0.04 }} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p style={{ fontFamily: F, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                {greet} 👋
              </p>
              <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.2rem)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
                {firstName},<br />
                <span style={{ color: '#a38a5e', fontStyle: 'italic' }}>votre tableau de bord.</span>
              </h1>
            </div>
            {hasLocation && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl self-start sm:self-auto"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <MapPin size={14} color="#10b981" />
                <span style={{ fontFamily: F, fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>{selectedLocationName}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { val: stats.recs, label: 'Analyses', icon: '🌱' },
              { val: stats.scans, label: 'Scans', icon: '🔬' },
              { val: '87%', label: 'Précision IA', icon: '🎯' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4 text-center"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                <div style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.5rem', color: 'white', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: F, fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* ── ACTIONS RAPIDES ── */}
        <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.4rem', color: '#064e3b', marginBottom: '1.2rem' }}>Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {QUICK.map((q, i) => (
            <Link key={i} to={q.to}>
              <div className="group p-5 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-1"
                style={{ background: 'white', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 16px rgba(6,78,59,0.05)' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: q.bg }}>
                  <span style={{ color: q.accent }}>{q.icon}</span>
                </div>
                <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{q.label}</div>
                <div style={{ fontFamily: F, fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.4 }}>{q.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── CONSEILS DU JOUR ── */}
          <div className="lg:col-span-2">
            <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.4rem', color: '#064e3b', marginBottom: '1.2rem' }}>Conseils du jour</h2>
            <div className="space-y-4">
              {TIPS.map((t, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-3xl"
                  style={{ background: 'white', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 16px rgba(6,78,59,0.04)' }}>
                  <span style={{ fontSize: '2rem', flexShrink: 0 }}>{t.icon}</span>
                  <div>
                    <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', marginBottom: '0.3rem' }}>{t.title}</div>
                    <div style={{ fontFamily: F, fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.7 }}>{t.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PROFIL RAPIDE ── */}
          <div>
            <h2 style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.4rem', color: '#064e3b', marginBottom: '1.2rem' }}>Mon compte</h2>
            <div className="rounded-3xl overflow-hidden" style={{ background: 'white', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 16px rgba(6,78,59,0.04)' }}>
              <div className="p-6" style={{ background: 'linear-gradient(135deg, #064e3b, #022c22)' }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>👨‍🌾</div>
                <div style={{ fontFamily: FH, fontWeight: 800, color: 'white', fontSize: '1.1rem' }}>{profile?.full_name || 'Producteur'}</div>
                <div style={{ fontFamily: F, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{user.email}</div>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { label: 'Modifier mon profil', to: '/profile' },
                  { label: 'Changer de localité', to: '/recommendations' },
                  { label: 'Mes recommandations', to: '/recommendations' },
                ].map((item, i) => (
                  <Link key={i} to={item.to}>
                    <div className="flex items-center justify-between p-3 rounded-2xl transition-colors hover:bg-gray-50 cursor-pointer">
                      <span style={{ fontFamily: F, fontSize: '0.82rem', color: '#064e3b', fontWeight: 600 }}>{item.label}</span>
                      <ChevronRight size={14} color="#9ca3af" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
