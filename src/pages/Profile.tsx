import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import {
  Loader2, Mail, LogOut, Save, Sprout, Microscope,
  TrendingUp, ChevronRight, Shield, Check, Edit3,
  User, MapPin, Award, Settings, Activity, Zap
} from 'lucide-react';
import type { User as SupaUser } from '@supabase/supabase-js';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

/* ─── TYPES ─── */
interface ProfileData {
  full_name:             string;
  phone:                 string;
  location:              string;
  farm_size_hectares:    string;
  primary_crops:         string[];
  // stats BDD
  points_total:          number;
  farmer_level:          string;
  completion_pct:        number;
  total_recommendations: number;
  total_scans:           number;
  last_activity_at:      string | null;
  // badges
  badge_first_analysis:    boolean;
  badge_disease_detective: boolean;
  badge_crop_expert:       boolean;
  badge_complete_profile:  boolean;
}

const DEFAULT_PROFILE: ProfileData = {
  full_name: '', phone: '', location: '', farm_size_hectares: '',
  primary_crops: [], points_total: 0, farmer_level: 'Débutant',
  completion_pct: 0, total_recommendations: 0, total_scans: 0,
  last_activity_at: null,
  badge_first_analysis: false, badge_disease_detective: false,
  badge_crop_expert: false, badge_complete_profile: false,
};

/* ─── DONNÉES ─── */
const CROPS = [
  { name: 'Manioc',           icon: '🌿', color: '#064e3b' },
  { name: 'Maïs',             icon: '🌽', color: '#d97706' },
  { name: 'Banane plantain',  icon: '🍌', color: '#b45309' },
  { name: 'Arachides',        icon: '🥜', color: '#92400e' },
  { name: 'Cacao',            icon: '🍫', color: '#7c2d12' },
  { name: 'Café',             icon: '☕', color: '#78350f' },
  { name: 'Palmier à huile',  icon: '🌴', color: '#166534' },
  { name: 'Igname',           icon: '🍠', color: '#9a3412' },
  { name: 'Légumes feuilles', icon: '🥬', color: '#15803d' },
  { name: 'Canne à sucre',    icon: '🎋', color: '#4d7c0f' },
];

const TABS = [
  { id: 'info',    label: 'Profil',      icon: <User size={15} /> },
  { id: 'crops',   label: 'Cultures',    icon: <Sprout size={15} /> },
  { id: 'badges',  label: 'Récompenses', icon: <Award size={15} /> },
  { id: 'account', label: 'Compte',      icon: <Settings size={15} /> },
];

const QUICK_LINKS = [
  { icon: <Sprout size={16} />,     bg: '#064e3b', label: 'Recommandations', to: '/recommendations' },
  { icon: <Microscope size={16} />, bg: '#7c2d12', label: 'Scanner maladies', to: '/disease-scanner' },
  { icon: <TrendingUp size={16} />, bg: '#1e3a5f', label: 'Prix du marché',   to: '/market' },
  { icon: <Activity size={16} />,   bg: '#422006', label: 'Assistant IA',     to: '/ai-assistant' },
];

const BADGES_DEF = [
  { icon: '🌱', label: 'Première analyse',   desc: 'Obtenir le 1er conseil IA',     key: 'badge_first_analysis',    points: 10  },
  { icon: '🔬', label: 'Détective maladies', desc: 'Scanner 3 plantes ou plus',     key: 'badge_disease_detective', points: 25  },
  { icon: '🌾', label: 'Expert cultures',    desc: 'Sélectionner 5 cultures',       key: 'badge_crop_expert',       points: 20  },
  { icon: '💡', label: 'Profil complet',     desc: 'Remplir toutes ses infos',      key: 'badge_complete_profile',  points: 15  },
  { icon: '📈', label: 'Maître du marché',   desc: 'Consulter les prix 10 fois',    key: null,                      points: 30  },
  { icon: '🏆', label: 'Expert 30 jours',    desc: 'Utiliser l\'app 30 jours',      key: null,                      points: 50  },
];

/* ─── COMPOSANT ─── */
export default function Profile() {
  const [user, setUser]       = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [tab, setTab]         = useState('info');
  const { toast }  = useToast();
  const navigate   = useNavigate();

  /* ─── LECTURE depuis user_profile_full ─── */
  const loadProfile = useCallback(async (uid: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profile_full')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name:             data.full_name             || '',
          phone:                 data.phone                 || '',
          location:              data.location              || '',
          farm_size_hectares:    data.farm_size_hectares?.toString() || '',
          primary_crops:         data.primary_crops         || [],
          points_total:          data.points_total          ?? 0,
          farmer_level:          data.farmer_level          || 'Débutant',
          completion_pct:        data.completion_pct        ?? 0,
          total_recommendations: data.total_recommendations ?? 0,
          total_scans:           data.total_scans           ?? 0,
          last_activity_at:      data.last_activity_at      || null,
          badge_first_analysis:    data.badge_first_analysis    ?? false,
          badge_disease_detective: data.badge_disease_detective ?? false,
          badge_crop_expert:       data.badge_crop_expert       ?? false,
          badge_complete_profile:  data.badge_complete_profile  ?? false,
        });
      }
    } catch (e: any) {
      toast({ title: 'Erreur de chargement', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/auth'); return; }
      setUser(session.user);
      loadProfile(session.user.id);
    });
  }, [navigate, loadProfile]);

  /* ─── ÉCRITURE dans profiles (les triggers recalculent les stats) ─── */
  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        user_id:            user.id,
        full_name:          profile.full_name          || null,
        phone:              profile.phone              || null,
        location:           profile.location           || null,
        farm_size_hectares: profile.farm_size_hectares ? parseFloat(profile.farm_size_hectares) : null,
        primary_crops:      profile.primary_crops,
      });
      if (error) throw error;

      // Relire les stats recalculées par les triggers BDD
      await loadProfile(user.id);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: '✅ Profil sauvegardé', description: 'Vos stats ont été recalculées.' });
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); navigate('/auth'); };
  const toggleCrop = (c: string) => setProfile(p => ({
    ...p,
    primary_crops: p.primary_crops.includes(c)
      ? p.primary_crops.filter(x => x !== c)
      : [...p.primary_crops, c],
  }));

  /* ─── STYLES ─── */
  const inp: React.CSSProperties = {
    width: '100%', padding: '0.9rem 1.1rem', borderRadius: '0.9rem',
    border: '1.5px solid rgba(6,78,59,0.12)', background: '#f9f6f0',
    fontFamily: F, fontSize: '0.86rem', color: '#064e3b',
    outline: 'none', boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    fontFamily: F, fontSize: '0.67rem', fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.5rem',
  };
  const card: React.CSSProperties = {
    background: 'white', borderRadius: '2rem', padding: '2rem',
    border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 4px 30px rgba(6,78,59,0.06)',
  };

  /* ─── CHARGEMENT ─── */
  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f6f0', flexDirection: 'column', gap: '1rem' }}>
      <Loader2 size={32} style={{ color: '#064e3b', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontFamily: F, fontSize: '0.85rem', color: '#9ca3af' }}>Chargement du profil…</span>
    </div>
  );

  /* ─── CALCUL DU BOUTON SAUVEGARDER ─── */
  const btnBg = saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#a38a5e,#8b7355)';
  const btnShadow = saved ? '0 6px 20px rgba(16,185,129,.3)' : '0 6px 20px rgba(163,138,94,.3)';

  /* ─── RENDU ─── */
  return (
    <div style={{ minHeight: '100vh', background: '#f9f6f0', fontFamily: F }}>

      {/* ══════════ HERO ══════════ */}
      <div style={{ background: 'linear-gradient(155deg,#011a12 0%,#022c22 40%,#064e3b 100%)', paddingTop: '5.5rem', position: 'relative', overflow: 'hidden' }}>

        {/* Motif hexagonal SVG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="hexPat" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
              <polygon points="30,0 60,15 60,37 30,52 0,37 0,15" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexPat)"/>
        </svg>

        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(163,138,94,.15) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>

          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
            <Link to="/dashboard" style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>Tableau de bord</Link>
            <ChevronRight size={11} color="rgba(255,255,255,.25)" />
            <span style={{ fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,.6)' }}>Mon profil</span>
          </div>

          {/* Carte principale */}
          <div style={{ background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '2rem', padding: '2rem 2.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>

            {/* Avatar + ring SVG de complétude */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <svg width="100" height="100" style={{ position: 'absolute', top: '-6px', left: '-6px', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3"/>
                <circle cx="50" cy="50" r="46" fill="none"
                  stroke={profile.completion_pct === 100 ? '#10b981' : '#a38a5e'}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 46}`}
                  strokeDashoffset={`${2 * Math.PI * 46 * (1 - profile.completion_pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1.2s ease' }}/>
              </svg>
              <div style={{ width: '88px', height: '88px', borderRadius: '1.6rem', background: 'linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.06))', border: '2px solid rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.6rem' }}>
                👨‍🌾
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '22px', height: '22px', borderRadius: '50%', background: '#10b981', border: '3px solid #022c22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'white' }} />
              </div>
            </div>

            {/* Nom + email + barre complétude */}
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: 'clamp(1.5rem,4vw,2.3rem)', color: 'white', letterSpacing: '-0.025em', lineHeight: 1 }}>
                  {profile.full_name || 'Mon profil'}
                </h1>
                {/* Badge niveau BDD */}
                <div style={{ padding: '0.25rem 0.8rem', borderRadius: '2rem', background: 'rgba(163,138,94,.2)', border: '1px solid rgba(163,138,94,.35)' }}>
                  <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.65rem', color: '#d4b896', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{profile.farmer_level}</span>
                </div>
              </div>
              <p style={{ fontFamily: F, fontSize: '0.8rem', color: 'rgba(255,255,255,.4)', marginBottom: '1rem' }}>{user.email}</p>

              {/* Barre complétude (depuis BDD) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, maxWidth: '220px' }}>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: `linear-gradient(90deg,#a38a5e,${profile.completion_pct === 100 ? '#10b981' : '#d4b896'})`, width: `${profile.completion_pct}%`, transition: 'width 1.2s ease' }} />
                  </div>
                </div>
                <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.75rem', color: profile.completion_pct === 100 ? '#10b981' : '#a38a5e' }}>
                  {profile.completion_pct}%
                </span>
                <span style={{ fontFamily: F, fontSize: '0.65rem', color: 'rgba(255,255,255,.3)' }}>complété</span>
              </div>
            </div>

            {/* Stats depuis BDD */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { val: profile.total_recommendations, icon: '🌱', label: 'Analyses' },
                { val: profile.total_scans,            icon: '🔬', label: 'Scans'    },
                { val: profile.points_total,           icon: '⭐', label: 'Points'   },
              ].map((s, i) => (
                <div key={i} style={{ minWidth: '72px', textAlign: 'center', padding: '0.9rem 1rem', borderRadius: '1.3rem', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.09)' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{s.icon}</div>
                  <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.5rem', color: 'white', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: F, fontSize: '0.58rem', color: 'rgba(255,255,255,.36)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Onglets */}
          <div style={{ display: 'flex', gap: '0.25rem', marginTop: '1.5rem' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.3rem', borderRadius: '1rem 1rem 0 0', border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: F, fontSize: '0.75rem', fontWeight: 700,
                  background: tab === t.id ? '#f9f6f0' : 'transparent',
                  color:      tab === t.id ? '#064e3b' : 'rgba(255,255,255,.45)' }}>
                <span style={{ opacity: tab === t.id ? 1 : 0.7 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ CONTENU ══════════ */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>

        {/* ── ONGLET PROFIL ── */}
        {tab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>

            {/* Formulaire infos personnelles */}
            <div style={{ ...card, borderRadius: '0 2rem 2rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '2rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '0.9rem', background: 'linear-gradient(135deg,#064e3b,#0a6644)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color="white" />
                </div>
                <div>
                  <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem', lineHeight: 1 }}>Informations personnelles</h2>
                  <p style={{ fontFamily: F, fontSize: '0.68rem', color: '#9ca3af', marginTop: '0.15rem' }}>Données enregistrées dans votre compte</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Email */}
                <div>
                  <label style={lbl}>Email</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.1rem', borderRadius: '0.9rem', background: '#f3f4f6' }}>
                    <Mail size={14} color="#9ca3af" />
                    <span style={{ fontFamily: F, fontSize: '0.85rem', color: '#9ca3af', flex: 1 }}>{user.email}</span>
                    <Shield size={12} color="#9ca3af" />
                  </div>
                </div>

                {/* Champs éditables */}
                {[
                  { label: 'Nom complet',        key: 'full_name',          placeholder: 'Votre nom et prénom',  type: 'text'   },
                  { label: 'Téléphone',           key: 'phone',              placeholder: '+242 06 xxx xx xx',    type: 'tel'    },
                  { label: 'Localité',            key: 'location',           placeholder: 'ex : Brazzaville',     type: 'text'   },
                  { label: 'Surface (hectares)',  key: 'farm_size_hectares', placeholder: 'ex : 2.5',             type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input type={f.type} value={(profile as any)[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} style={inp} />
                  </div>
                ))}
              </div>

              <button onClick={save} disabled={saving}
                style={{ width: '100%', marginTop: '1.8rem', padding: '1rem', borderRadius: '1rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, color: 'white', background: btnBg, boxShadow: btnShadow, opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
                {saving ? 'Sauvegarde…' : saved ? 'Enregistré !' : 'Sauvegarder les modifications'}
              </button>
            </div>

            {/* Colonne droite */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Accès rapide */}
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem 1.5rem 1rem', fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '0.95rem' }}>Accès rapide</div>
                {QUICK_LINKS.map((item, i, arr) => (
                  <Link key={i} to={item.to} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.95rem 1.5rem', borderTop: '1px solid rgba(6,78,59,.05)', transition: 'background .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f9f6f0')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '0.8rem', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>{item.icon}</div>
                        <span style={{ fontFamily: F, fontWeight: 600, fontSize: '0.82rem', color: '#064e3b' }}>{item.label}</span>
                      </div>
                      <ChevronRight size={14} color="#9ca3af" />
                    </div>
                  </Link>
                ))}
              </div>

              {/* Niveau agriculteur (données BDD) */}
              <div style={{ background: 'linear-gradient(135deg,#022c22,#064e3b)', borderRadius: '2rem', padding: '1.8rem', border: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <Zap size={17} color="#a38a5e" />
                    <span style={{ fontFamily: FH, fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Niveau Agriculteur</span>
                  </div>
                  <span style={{ padding: '0.25rem 0.8rem', borderRadius: '2rem', background: 'rgba(163,138,94,.2)', border: '1px solid rgba(163,138,94,.3)', fontFamily: FH, fontWeight: 700, fontSize: '0.68rem', color: '#d4b896' }}>
                    {profile.farmer_level}
                  </span>
                </div>

                {[
                  { label: 'Recommandations IA',  val: Math.min(profile.total_recommendations, 5), max: 5,   color: '#10b981', display: `${profile.total_recommendations}/5` },
                  { label: 'Scans maladies',       val: Math.min(profile.total_scans, 5),           max: 5,   color: '#f59e0b', display: `${profile.total_scans}/5`           },
                  { label: 'Profil complété',      val: profile.completion_pct,                     max: 100, color: '#a38a5e', display: `${profile.completion_pct}%`         },
                ].map((bar, i) => (
                  <div key={i} style={{ marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontFamily: F, fontSize: '0.68rem', color: 'rgba(255,255,255,.45)' }}>{bar.label}</span>
                      <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.7rem', color: bar.color }}>{bar.display}</span>
                    </div>
                    <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,.08)' }}>
                      <div style={{ height: '100%', borderRadius: '3px', background: bar.color, width: `${(bar.val / bar.max) * 100}%`, transition: 'width 1s ease' }} />
                    </div>
                  </div>
                ))}

                {/* Points totaux */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  <span style={{ fontFamily: F, fontSize: '0.72rem', color: 'rgba(255,255,255,.4)' }}>Score total</span>
                  <span style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.5rem', color: '#a38a5e' }}>{profile.points_total} pts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET CULTURES ── */}
        {tab === 'crops' && (
          <div style={{ ...card, borderRadius: '0 2rem 2rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem' }}>Mes cultures principales</h2>
              <span style={{ padding: '0.3rem 0.8rem', borderRadius: '2rem', background: 'rgba(6,78,59,.07)', fontFamily: FH, fontWeight: 700, fontSize: '0.75rem', color: '#064e3b' }}>
                {profile.primary_crops.length} / {CROPS.length}
              </span>
            </div>
            <p style={{ fontFamily: F, fontSize: '0.78rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.6 }}>
              Sélectionnez toutes vos cultures. Ces données personnalisent vos recommandations IA, alertes météo et analyses de prix de marché.
              {profile.primary_crops.length >= 5 && <span style={{ color: '#10b981', fontWeight: 600 }}> ✅ Badge "Expert cultures" débloqué !</span>}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: '0.9rem', marginBottom: '2rem' }}>
              {CROPS.map(c => {
                const active = profile.primary_crops.includes(c.name);
                return (
                  <button key={c.name} onClick={() => toggleCrop(c.name)}
                    style={{ position: 'relative', padding: '1.2rem 1rem', borderRadius: '1.3rem', textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
                      border: `2px solid ${active ? c.color : 'rgba(6,78,59,.08)'}`,
                      background: active ? `${c.color}12` : '#f9f6f0',
                      boxShadow: active ? `0 4px 20px ${c.color}25` : 'none',
                      transform: active ? 'translateY(-2px)' : 'none' }}>
                    {active && (
                      <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={10} color="white" />
                      </div>
                    )}
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{c.icon}</div>
                    <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.78rem', color: active ? c.color : '#064e3b', lineHeight: 1.2 }}>{c.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Résumé sélection */}
            {profile.primary_crops.length > 0 && (
              <div style={{ background: '#f9f6f0', borderRadius: '1.2rem', padding: '1.2rem 1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.7rem' }}>✅ Cultures sélectionnées</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.primary_crops.map((c, i) => {
                    const crop = CROPS.find(cr => cr.name === c);
                    return (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.85rem', borderRadius: '2rem', background: 'white', border: '1.5px solid rgba(6,78,59,.12)', fontFamily: F, fontSize: '0.75rem', fontWeight: 600, color: '#064e3b' }}>
                        {crop?.icon} {c}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={save} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.95rem 2rem', borderRadius: '1rem', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, color: 'white', background: btnBg, boxShadow: btnShadow }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
              {saved ? 'Enregistré !' : 'Sauvegarder mes cultures'}
            </button>
          </div>
        )}

        {/* ── ONGLET RÉCOMPENSES ── */}
        {tab === 'badges' && (
          <div>
            <div style={{ ...card, borderRadius: '0 2rem 2rem 2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: '0.4rem' }}>Vos récompenses</h2>
              <p style={{ fontFamily: F, fontSize: '0.78rem', color: '#9ca3af', marginBottom: '2rem' }}>Les badges débloqués sont calculés automatiquement et sauvegardés dans votre profil.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
                {BADGES_DEF.map((b, i) => {
                  const unlocked = b.key ? !!(profile as any)[b.key] : false;
                  return (
                    <div key={i} style={{ borderRadius: '1.5rem', padding: '1.5rem', position: 'relative', overflow: 'hidden',
                      background: unlocked ? 'linear-gradient(135deg,#f0fdf4,#dcfce7)' : '#f9f6f0',
                      border: `2px solid ${unlocked ? 'rgba(16,185,129,.3)' : 'rgba(6,78,59,.07)'}`,
                      opacity: unlocked ? 1 : 0.5,
                      filter: unlocked ? 'none' : 'grayscale(0.3)' }}>
                      {unlocked && (
                        <div style={{ position: 'absolute', top: 0, right: 0, background: '#10b981', padding: '0.3rem 0.7rem', borderRadius: '0 1.3rem 0 0.8rem' }}>
                          <span style={{ fontFamily: F, fontSize: '0.58rem', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Débloqué</span>
                        </div>
                      )}
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>{b.icon}</div>
                      <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '0.88rem', marginBottom: '0.3rem' }}>{b.label}</div>
                      <div style={{ fontFamily: F, fontSize: '0.7rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '0.8rem' }}>{b.desc}</div>
                      <div style={{ display: 'inline-block', padding: '0.25rem 0.7rem', borderRadius: '2rem', background: unlocked ? 'rgba(16,185,129,.15)' : 'rgba(6,78,59,.07)', fontFamily: FH, fontWeight: 700, fontSize: '0.65rem', color: unlocked ? '#10b981' : '#9ca3af' }}>
                        {unlocked ? `+${b.points} pts` : `🔒 ${b.points} pts`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score total (depuis BDD) */}
            <div style={{ background: 'linear-gradient(135deg,#022c22,#064e3b)', borderRadius: '2rem', padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '1.4rem', background: 'rgba(163,138,94,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>⭐</div>
              <div>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '2.8rem', color: '#a38a5e', lineHeight: 1 }}>{profile.points_total}</div>
                <div style={{ fontFamily: F, fontSize: '0.75rem', color: 'rgba(255,255,255,.4)', marginTop: '0.2rem' }}>points · niveau <span style={{ color: '#d4b896', fontWeight: 700 }}>{profile.farmer_level}</span></div>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontFamily: F, fontSize: '0.75rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.7 }}>
                  Prochain niveau : {profile.farmer_level === 'Débutant' ? '10 pts (Junior)' : profile.farmer_level === 'Junior' ? '35 pts (Confirmé)' : profile.farmer_level === 'Confirmé' ? '70 pts (Expert)' : '🏆 Niveau maximum atteint !'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ONGLET COMPTE ── */}
        {tab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '560px' }}>

            <div style={{ ...card, borderRadius: '0 2rem 2rem 2rem' }}>
              <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem', marginBottom: '1.5rem' }}>Informations du compte</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { icon: <Mail size={15} />,   label: 'Adresse email',  val: user.email || '',  sub: 'Non modifiable' },
                  { icon: <Shield size={15} />, label: 'Niveau',         val: profile.farmer_level, sub: `${profile.points_total} points` },
                  { icon: <MapPin size={15} />, label: 'Dernière activité', val: profile.last_activity_at
                      ? new Date(profile.last_activity_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'Inconnue', sub: '' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', background: '#f9f6f0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '0.8rem', background: '#064e3b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: F, fontSize: '0.67rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</div>
                      <div style={{ fontFamily: F, fontWeight: 600, fontSize: '0.85rem', color: '#064e3b', marginTop: '0.1rem' }}>{item.val}</div>
                    </div>
                    {item.sub && <span style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af' }}>{item.sub}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, border: '1px solid rgba(220,38,38,.1)', boxShadow: '0 4px 30px rgba(220,38,38,.04)' }}>
              <h2 style={{ fontFamily: FH, fontWeight: 800, color: '#dc2626', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Déconnexion</h2>
              <p style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Vos données restent sauvegardées dans la base. Vous pouvez vous reconnecter à tout moment.
              </p>
              <button onClick={signOut}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 1.8rem', borderRadius: '1rem', border: '2px solid rgba(220,38,38,.2)', background: 'rgba(220,38,38,.04)', cursor: 'pointer', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,.04)'; }}>
                <LogOut size={15} /> Se déconnecter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
