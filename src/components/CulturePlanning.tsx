/**
 * CulturePlanning.tsx
 * Planning intelligent des cultures — Composte AI
 * Section à insérer dans la page Weather
 */
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocationContext } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import { openAIService } from '@/services/openai';
import AIProviderSelector from '@/components/AIProviderSelector';
import {
  Plus, ChevronDown, ChevronUp, Trash2, Loader2,
  Sprout, CheckCircle2, Circle, ChevronRight,
  RefreshCw, X
} from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

/* ─── TYPES ─── */
interface CropCycle {
  id:                string;
  crop_name:         string;
  variety?:          string;
  superficie_m2?:    number;
  duration_days:     number;
  nursery_days:      number;
  start_date:        string;
  expected_end_date: string;
  tools:             string[];
  workers_count:     number;
  treatments:        Treatment[];
  status:            'planned' | 'active' | 'completed' | 'abandoned';
  ai_calendar?:      CalendarPhase[];
  ai_weekly_tasks?:  WeeklyBlock[];
  ai_generated_at?:  string;
}

interface Treatment {
  name:      string;
  type:      'engrais' | 'pesticide' | 'fongicide' | 'autre';
  frequency: string;
}

interface CropTask {
  id:             string;
  cycle_id:       string;
  scheduled_date: string;
  week_number?:   number;
  day_number?:    number;
  category:       'arrosage' | 'traitement' | 'récolte' | 'désherbage' | 'fertilisation' | 'observation' | 'autre';
  title:          string;
  description?:   string;
  priority:       'low' | 'normal' | 'high' | 'urgent';
  done:           boolean;
  notes?:         string;
  crop_name?:     string;
}

interface CalendarPhase {
  phase:        string;
  start_day:    number;
  end_day:      number;
  description:  string;
  key_actions:  string[];
}

interface WeeklyBlock {
  week:    number;
  title:   string;
  tasks:   string[];
  risks?:  string;
  tips?:   string;
}

/* ─── CONSTANTES ─── */
const CATEGORY_META: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  arrosage:      { icon: '💧', color: '#3b82f6', bg: '#eff6ff',  label: 'Arrosage'      },
  traitement:    { icon: '🧪', color: '#8b5cf6', bg: '#f5f3ff',  label: 'Traitement'    },
  recolte:       { icon: '🌾', color: '#f59e0b', bg: '#fffbeb',  label: 'Récolte'       },
  desherbage:    { icon: '🌿', color: '#10b981', bg: '#f0fdf4',  label: 'Désherbage'    },
  fertilisation: { icon: '🪣', color: '#a38a5e', bg: '#fdf8f0',  label: 'Fertilisation' },
  observation:   { icon: '👁️', color: '#6b7280', bg: '#f9fafb',  label: 'Observation'   },
  autre:         { icon: '📌', color: '#064e3b', bg: '#f0fdf4',  label: 'Autre'         },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  low:    { label: 'Faible',  color: '#9ca3af' },
  normal: { label: 'Normal',  color: '#064e3b' },
  high:   { label: 'Haute',   color: '#f59e0b' },
  urgent: { label: 'Urgent',  color: '#ef4444' },
};

const TOOLS_SUGGESTIONS = ['Machette','Houe','Arrosoir','Pompe à eau','Pulvérisateur','Brouette','Transplantoir','Sarcleuse'];
const TREATMENTS_TYPES  = ['engrais','pesticide','fongicide','autre'] as const;
const DURATIONS = [
  { label: '45 jours (ciboule, laitue)', days: 45 },
  { label: '60 jours (haricot, radis)',  days: 60 },
  { label: '90 jours (maïs, concombre)',  days: 90 },
  { label: '4 mois (tomate, aubergine)',  days: 120 },
  { label: '6 mois (gombo, poivron)',     days: 180 },
  { label: '1 an (manioc)',               days: 365 },
  { label: 'Personnalisé',                days: 0 },
];

/* ─── HELPERS ─── */
function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}
function daysUntil(dateStr: string): number {
  return Math.floor((new Date(dateStr).getTime() - Date.now()) / 86400000);
}
function progressPct(cycle: CropCycle): number {
  const elapsed = daysSince(cycle.start_date);
  return Math.min(100, Math.max(0, Math.round((elapsed / cycle.duration_days) * 100)));
}
function progressColor(pct: number): string {
  if (pct >= 80) return '#f59e0b';
  if (pct >= 50) return '#10b981';
  return '#064e3b';
}

/* ─── CARD ─── */
function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'white', borderRadius: '2rem', padding: '2rem',
      border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.05)',
      ...style
    }}>{children}</div>
  );
}

/* ═══════════════════════════════════════
   COMPOSANT PRINCIPAL
═══════════════════════════════════════ */
interface CulturePlanningProps {
  weather?: any;
  forecast?: any[];
}

export default function CulturePlanning({ weather, forecast }: CulturePlanningProps) {
  const { selectedLocationName, primaryCrops, bestSeasons } = useLocationContext();
  const { toast } = useToast();

  const [userId, setUserId]     = useState<string | null>(null);
  const [cycles, setCycles]     = useState<CropCycle[]>([]);
  const [tasks, setTasks]       = useState<CropTask[]>([]);
  const [loading, setLoading]   = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null); // cycle id en cours de génération

  // UI
  const [showForm, setShowForm]         = useState(false);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);
  const [activeTab, setActiveTab]       = useState<'planning' | 'tasks'>('tasks');
  const [taskFilter, setTaskFilter]     = useState<'today' | 'week' | 'all'>('week');

  // Formulaire nouveau cycle
  const emptyForm = {
    crop_name: '', variety: '', superficie_m2: '', duration_days: 45,
    nursery_days: 0, start_date: new Date().toISOString().split('T')[0],
    tools: [] as string[], workers_count: 1,
    treatments: [] as Treatment[], customDuration: false,
  };
  const [form, setForm] = useState(emptyForm);
  const [newTreatment, setNewTreatment] = useState({ name: '', type: 'engrais' as typeof TREATMENTS_TYPES[number], frequency: '' });

  /* ─── AUTH ─── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setUserId(session.user.id); }
    });
  }, []);

  /* ─── CHARGEMENT ─── */
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [{ data: c }, { data: t }] = await Promise.all([
        supabase.from('crop_cycles').select('*').eq('user_id', userId).neq('status', 'abandoned').order('start_date', { ascending: false }),
        supabase.from('crop_tasks').select('*').eq('user_id', userId).order('scheduled_date'),
      ]);
      if (c) setCycles(c as CropCycle[]);
      if (t) setTasks(t as CropTask[]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  /* ─── CRÉER UN CYCLE ─── */
  const createCycle = async () => {
    if (!userId || !form.crop_name || !form.start_date) {
      toast({ title: 'Remplissez le nom de la culture et la date de début', variant: 'destructive' }); return;
    }
    setLoading(true);
    try {
      const payload = {
        user_id:       userId,
        crop_name:     form.crop_name.trim(),
        variety:       form.variety || null,
        superficie_m2: form.superficie_m2 ? parseFloat(form.superficie_m2) : null,
        duration_days: form.duration_days,
        nursery_days:  form.nursery_days,
        start_date:    form.start_date,
        tools:         form.tools,
        workers_count: form.workers_count,
        treatments:    form.treatments,
        status:        'active',
      };
      const { data, error } = await supabase.from('crop_cycles').insert(payload).select().single();
      if (error) throw error;
      toast({ title: `✅ Culture "${form.crop_name}" ajoutée !` });
      setShowForm(false);
      setForm(emptyForm);
      await loadData();
      // Génération IA automatique
      if (data) generateAICalendar(data as CropCycle);
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  /* ─── GÉNÉRATION IA ─── */
  const generateAICalendar = async (cycle: CropCycle) => {
    setAiLoading(cycle.id);
    try {
      const weatherCtx = weather
        ? `${Math.round(weather.main?.temp)}°C, humidité ${weather.main?.humidity}%, ${weather.weather?.[0]?.description}`
        : undefined;
      const forecastCtx = forecast && forecast.length > 0
        ? forecast.slice(0, 5).map((d: any) => `${Math.round(d.main?.temp)}°C`).join(', ')
        : undefined;

      const parsed = await openAIService.generateCropPlanning({
        cropName:     cycle.crop_name,
        variety:      cycle.variety,
        superficie:   cycle.superficie_m2 ?? undefined,
        durationDays: cycle.duration_days,
        nurseryDays:  cycle.nursery_days,
        startDate:    cycle.start_date,
        tools:        cycle.tools,
        workers:      cycle.workers_count,
        treatments:   cycle.treatments,
        location:     selectedLocationName || 'Congo Brazzaville',
        weather:      weatherCtx,
        forecast:     forecastCtx,
      });

      if (!parsed) throw new Error('Aucune réponse IA. Vérifiez la clé VITE_OPENAI_API_KEY dans Vercel.');

      // Sauvegarder le calendrier dans Supabase
      const { error: upErr } = await supabase.from('crop_cycles').update({
        ai_calendar:     parsed.phases || [],
        ai_weekly_tasks: parsed.weekly_tasks || [],
        ai_generated_at: new Date().toISOString(),
        weather_snapshot: weather || null,
      }).eq('id', cycle.id);
      if (upErr) throw upErr;

      // Créer les tâches immédiates
      if (parsed.immediate_tasks && userId) {
        const startDate = new Date(cycle.start_date);
        const taskRows = parsed.immediate_tasks.map((t: any) => {
          const d = new Date(startDate);
          d.setDate(d.getDate() + (t.day_offset || 0));
          return {
            cycle_id:       cycle.id,
            user_id:        userId,
            scheduled_date: d.toISOString().split('T')[0],
            day_number:     t.day_offset + 1,
            week_number:    Math.ceil((t.day_offset + 1) / 7),
            category:       t.category || 'autre',
            title:          t.title,
            description:    t.description,
            priority:       t.priority || 'normal',
          };
        });
        await supabase.from('crop_tasks').insert(taskRows);
      }

      toast({ title: '🤖 Planning IA généré !', description: 'Calendrier et tâches créés automatiquement.' });
      await loadData();
    } catch (e: any) {
      toast({ title: 'Erreur IA', description: e.message, variant: 'destructive' });
    } finally {
      setAiLoading(null);
    }
  };
  /* ─── MARQUER TÂCHE ─── */
  const toggleTask = async (task: CropTask) => {
    const { error } = await supabase.from('crop_tasks').update({
      done:    !task.done,
      done_at: !task.done ? new Date().toISOString() : null,
    }).eq('id', task.id);
    if (!error) setTasks(ts => ts.map(t => t.id === task.id ? { ...t, done: !t.done } : t));
  };

  /* ─── SUPPRIMER CYCLE ─── */
  const deleteCycle = async (id: string) => {
    if (!confirm('Supprimer cette culture et toutes ses tâches ?')) return;
    await supabase.from('crop_cycles').update({ status: 'abandoned' }).eq('id', id);
    setCycles(cs => cs.filter(c => c.id !== id));
    toast({ title: 'Culture archivée.' });
  };

  /* ─── FILTRER TÂCHES ─── */
  const filteredTasks = tasks.filter(t => {
    const d = new Date(t.scheduled_date);
    const now = new Date(); now.setHours(0,0,0,0);
    if (taskFilter === 'today') return d.toDateString() === now.toDateString();
    if (taskFilter === 'week') {
      const end = new Date(now); end.setDate(end.getDate() + 7);
      return d >= now && d <= end;
    }
    return true;
  });

  const pendingToday = tasks.filter(t => {
    const d = new Date(t.scheduled_date);
    const now = new Date(); now.setHours(0,0,0,0);
    return d.toDateString() === now.toDateString() && !t.done;
  }).length;

  /* ─── STYLES ─── */
  const inp: React.CSSProperties = {
    width: '100%', padding: '0.8rem 1rem', borderRadius: '0.9rem',
    border: '1.5px solid rgba(6,78,59,0.12)', background: '#f9f6f0',
    fontFamily: F, fontSize: '0.85rem', color: '#064e3b', outline: 'none',
    boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    fontFamily: F, fontSize: '0.67rem', fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.4rem',
  };

  if (!userId) return (
    <div style={{ background: 'white', borderRadius: '2rem', padding: '2.5rem', textAlign: 'center', border: '1px solid rgba(6,78,59,0.07)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
      <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Connectez-vous pour accéder au planning</div>
      <div style={{ fontFamily: F, fontSize: '0.82rem', color: '#9ca3af' }}>Le planning de cultures nécessite un compte Composte AI.</div>
    </div>
  );

  /* ─────────── RENDU ─────────── */
  return (
    <div style={{ fontFamily: F }}>

      {/* ══ TITRE SECTION ══ */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.6rem', color: '#064e3b', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '0.3rem' }}>
            📅 Planning des cultures
          </h2>
          <p style={{ fontFamily: F, fontSize: '0.78rem', color: '#9ca3af' }}>
            Planifiez et suivez vos cultures avec des tâches générées par IA selon la météo
          </p>
          <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af' }}>IA :</span>
            <AIProviderSelector compact />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {pendingToday > 0 && (
            <div style={{ padding: '0.4rem 1rem', borderRadius: '2rem', background: '#fef3c7', border: '1.5px solid #fde68a', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: '#92400e' }}>
              ⚠️ {pendingToday} tâche{pendingToday > 1 ? 's' : ''} aujourd'hui
            </div>
          )}
          <button onClick={() => setShowForm(!showForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem', borderRadius: '2rem', background: showForm ? '#f9f6f0' : '#064e3b', border: `1.5px solid ${showForm ? 'rgba(6,78,59,0.15)' : '#064e3b'}`, cursor: 'pointer', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, color: showForm ? '#064e3b' : 'white' }}>
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? 'Annuler' : 'Nouvelle culture'}
          </button>
        </div>
      </div>

      {/* ══ FORMULAIRE NOUVEAU CYCLE ══ */}
      {showForm && (
        <Card style={{ marginBottom: '1.5rem', border: '2px solid rgba(6,78,59,0.12)' }}>
          <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            🌱 Ajouter une culture
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={lbl}>Nom de la culture *</label>
              <input value={form.crop_name} onChange={e => setForm(f => ({ ...f, crop_name: e.target.value }))}
                placeholder="ex : Ciboule, Tomate…" style={inp} list="crops-list" />
              <datalist id="crops-list">
                {['Ciboule','Tomate','Concombre','Maïs','Manioc','Aubergine','Gombo','Poivron','Laitue','Haricot','Arachide','Chou'].map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label style={lbl}>Variété (optionnel)</label>
              <input value={form.variety} onChange={e => setForm(f => ({ ...f, variety: e.target.value }))}
                placeholder="ex : Roma, Cherry…" style={inp} />
            </div>
            <div>
              <label style={lbl}>Superficie (m²)</label>
              <input type="number" value={form.superficie_m2} onChange={e => setForm(f => ({ ...f, superficie_m2: e.target.value }))}
                placeholder="ex : 500" style={inp} />
            </div>
            <div>
              <label style={lbl}>Date de début *</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inp} />
            </div>
          </div>

          {/* Durée */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={lbl}>Durée de la culture</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
              {DURATIONS.map(d => (
                <button key={d.days} onClick={() => setForm(f => ({ ...f, duration_days: d.days || f.duration_days, customDuration: d.days === 0 }))}
                  style={{ padding: '0.4rem 0.9rem', borderRadius: '2rem', fontFamily: F, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                    background: (d.days === form.duration_days && !form.customDuration) || (d.days === 0 && form.customDuration) ? '#064e3b' : '#f9f6f0',
                    color: (d.days === form.duration_days && !form.customDuration) || (d.days === 0 && form.customDuration) ? 'white' : '#064e3b',
                    border: `1.5px solid ${(d.days === form.duration_days && !form.customDuration) || (d.days === 0 && form.customDuration) ? '#064e3b' : 'rgba(6,78,59,0.12)'}` }}>
                  {d.label}
                </button>
              ))}
            </div>
            {form.customDuration && (
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <input type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: parseInt(e.target.value) || 30 }))}
                  placeholder="Durée en jours" style={{ ...inp, width: '150px', flex: 'none' }} />
                <input type="number" value={form.nursery_days} onChange={e => setForm(f => ({ ...f, nursery_days: parseInt(e.target.value) || 0 }))}
                  placeholder="dont X jours pépinière" style={{ ...inp, flex: 1 }} />
              </div>
            )}
          </div>

          {/* Ressources */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
            <div>
              <label style={lbl}>Nombre de travailleurs</label>
              <input type="number" min="1" value={form.workers_count} onChange={e => setForm(f => ({ ...f, workers_count: parseInt(e.target.value) || 1 }))} style={inp} />
            </div>
          </div>

          {/* Outils */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={lbl}>Outils disponibles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {TOOLS_SUGGESTIONS.map(tool => (
                <button key={tool} onClick={() => setForm(f => ({ ...f, tools: f.tools.includes(tool) ? f.tools.filter(t => t !== tool) : [...f.tools, tool] }))}
                  style={{ padding: '0.35rem 0.85rem', borderRadius: '2rem', fontFamily: F, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    background: form.tools.includes(tool) ? '#a38a5e' : '#f9f6f0',
                    color: form.tools.includes(tool) ? 'white' : '#064e3b',
                    border: `1.5px solid ${form.tools.includes(tool) ? '#a38a5e' : 'rgba(6,78,59,0.12)'}` }}>
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Traitements */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Traitements (engrais, pesticides…)</label>
            {form.treatments.map((tr, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.6rem 1rem', borderRadius: '0.8rem', background: '#f9f6f0' }}>
                <span style={{ fontFamily: F, fontSize: '0.8rem', color: '#064e3b', flex: 1 }}>
                  <strong>{tr.name}</strong> ({tr.type}) — {tr.frequency}
                </span>
                <button onClick={() => setForm(f => ({ ...f, treatments: f.treatments.filter((_, j) => j !== i) }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '0.5rem', alignItems: 'end' }}>
              <div>
                <input value={newTreatment.name} onChange={e => setNewTreatment(t => ({ ...t, name: e.target.value }))}
                  placeholder="Nom du produit" style={inp} />
              </div>
              <div>
                <select value={newTreatment.type} onChange={e => setNewTreatment(t => ({ ...t, type: e.target.value as any }))}
                  style={{ ...inp, appearance: 'none' }}>
                  {TREATMENTS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <input value={newTreatment.frequency} onChange={e => setNewTreatment(t => ({ ...t, frequency: e.target.value }))}
                  placeholder="Fréquence (ex: 1x/semaine)" style={inp} />
              </div>
              <button onClick={() => {
                if (!newTreatment.name) return;
                setForm(f => ({ ...f, treatments: [...f.treatments, { ...newTreatment }] }));
                setNewTreatment({ name: '', type: 'engrais', frequency: '' });
              }} style={{ padding: '0.8rem 1rem', borderRadius: '0.9rem', background: '#064e3b', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={createCycle} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2rem', borderRadius: '1.5rem', background: '#064e3b', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, color: 'white', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Sprout size={15} />}
              Créer le planning IA
            </button>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); }}
              style={{ padding: '0.9rem 1.5rem', borderRadius: '1.5rem', background: 'white', border: '1.5px solid rgba(6,78,59,0.15)', cursor: 'pointer', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, color: '#064e3b' }}>
              Annuler
            </button>
          </div>
        </Card>
      )}

      {/* ══ LISTE DES CYCLES ══ */}
      {loading && cycles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Loader2 size={28} style={{ color: '#064e3b', animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}

      {!loading && cycles.length === 0 && !showForm && (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <div style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Aucune culture planifiée</div>
          <div style={{ fontFamily: F, fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1.5rem' }}>Commencez par ajouter votre première culture pour générer un planning IA personnalisé.</div>
          <button onClick={() => setShowForm(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.8rem', borderRadius: '2rem', background: '#064e3b', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
            <Plus size={15} /> Ajouter une culture
          </button>
        </Card>
      )}

      {cycles.map(cycle => {
        const pct  = progressPct(cycle);
        const pCol = progressColor(pct);
        const daysLeft = daysUntil(cycle.expected_end_date);
        const isExpanded = expandedCycle === cycle.id;
        const cycleTasks = tasks.filter(t => t.cycle_id === cycle.id);
        const doneTasks  = cycleTasks.filter(t => t.done).length;

        return (
          <Card key={cycle.id} style={{ marginBottom: '1.2rem' }}>
            {/* ── En-tête du cycle ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}
              onClick={() => setExpandedCycle(isExpanded ? null : cycle.id)}>

              {/* Icône culture */}
              <div style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'linear-gradient(135deg,#064e3b,#0a6644)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>
                🌿
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1.05rem', margin: 0 }}>
                    {cycle.crop_name}{cycle.variety ? ` · ${cycle.variety}` : ''}
                  </h3>
                  <span style={{ padding: '0.2rem 0.7rem', borderRadius: '2rem', fontFamily: F, fontSize: '0.62rem', fontWeight: 700,
                    background: cycle.status === 'active' ? '#dcfce7' : '#f9f6f0',
                    color: cycle.status === 'active' ? '#166534' : '#9ca3af' }}>
                    {cycle.status === 'active' ? '● En cours' : cycle.status}
                  </span>
                  {aiLoading === cycle.id && (
                    <span style={{ padding: '0.2rem 0.7rem', borderRadius: '2rem', background: '#eff6ff', fontFamily: F, fontSize: '0.62rem', fontWeight: 700, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Loader2 size={10} className="animate-spin" /> IA en cours…
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: F, fontSize: '0.72rem', color: '#9ca3af' }}>
                    📅 Début {new Date(cycle.start_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span style={{ fontFamily: F, fontSize: '0.72rem', color: '#9ca3af' }}>
                    🏁 Fin {new Date(cycle.expected_end_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                  {cycle.superficie_m2 && (
                    <span style={{ fontFamily: F, fontSize: '0.72rem', color: '#9ca3af' }}>
                      📐 {cycle.superficie_m2} m²
                    </span>
                  )}
                  <span style={{ fontFamily: F, fontSize: '0.72rem', color: '#9ca3af' }}>
                    ✅ {doneTasks}/{cycleTasks.length} tâches
                  </span>
                </div>

                {/* Barre de progression */}
                <div style={{ marginTop: '0.7rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af' }}>Progression</span>
                    <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.72rem', color: pCol }}>
                      {pct}% · {daysLeft > 0 ? `J-${daysLeft}` : 'Terminé'}
                    </span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: '#e5e7eb', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '3px', background: pCol, width: `${pct}%`, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => generateAICalendar(cycle)} disabled={!!aiLoading}
                  title="Régénérer le planning IA"
                  style={{ width: '34px', height: '34px', borderRadius: '0.8rem', background: '#f9f6f0', border: '1.5px solid rgba(6,78,59,0.1)', cursor: aiLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b' }}>
                  <RefreshCw size={14} />
                </button>
                <button onClick={() => deleteCycle(cycle.id)}
                  style={{ width: '34px', height: '34px', borderRadius: '0.8rem', background: '#fef2f2', border: '1.5px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
                <button style={{ width: '34px', height: '34px', borderRadius: '0.8rem', background: '#f9f6f0', border: '1.5px solid rgba(6,78,59,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#064e3b' }}>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            </div>

            {/* ── DÉTAIL DÉPLIÉ ── */}
            {isExpanded && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(6,78,59,0.07)' }}>

                {/* Onglets */}
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem' }}>
                  {[
                    { id: 'tasks',    label: `Tâches (${cycleTasks.filter(t => !t.done).length} en attente)` },
                    { id: 'planning', label: 'Calendrier IA' },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                      style={{ padding: '0.55rem 1.2rem', borderRadius: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.15s',
                        background: activeTab === tab.id ? '#064e3b' : '#f9f6f0',
                        color: activeTab === tab.id ? 'white' : '#064e3b' }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ─── ONGLET TÂCHES ─── */}
                {activeTab === 'tasks' && (
                  <div>
                    {cycleTasks.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af', fontFamily: F, fontSize: '0.82rem' }}>
                        {aiLoading === cycle.id ? '⏳ Génération des tâches en cours…' : 'Aucune tâche. Cliquez sur 🔄 pour générer le planning IA.'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {cycleTasks.map(task => {
                          const meta = CATEGORY_META[task.category] || CATEGORY_META.autre;
                          const prioMeta = PRIORITY_META[task.priority] || PRIORITY_META.normal;
                          const isOverdue = !task.done && new Date(task.scheduled_date) < new Date();
                          return (
                            <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '0.9rem 1rem', borderRadius: '1rem',
                              background: task.done ? '#f9fafb' : meta.bg,
                              border: `1.5px solid ${task.done ? '#e5e7eb' : isOverdue ? '#fca5a5' : 'transparent'}`,
                              opacity: task.done ? 0.6 : 1 }}>
                              <button onClick={() => toggleTask(task)}
                                style={{ flexShrink: 0, marginTop: '2px', background: 'none', border: 'none', cursor: 'pointer', color: task.done ? '#10b981' : meta.color, padding: 0 }}>
                                {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                              </button>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.9rem' }}>{meta.icon}</span>
                                  <span style={{ fontFamily: F, fontWeight: 700, fontSize: '0.83rem', color: task.done ? '#9ca3af' : '#064e3b', textDecoration: task.done ? 'line-through' : 'none' }}>
                                    {task.title}
                                  </span>
                                  {task.priority !== 'normal' && (
                                    <span style={{ fontFamily: F, fontSize: '0.6rem', fontWeight: 700, color: prioMeta.color }}>
                                      {prioMeta.label}
                                    </span>
                                  )}
                                  {isOverdue && !task.done && (
                                    <span style={{ fontFamily: F, fontSize: '0.6rem', fontWeight: 700, color: '#ef4444' }}>EN RETARD</span>
                                  )}
                                </div>
                                {task.description && (
                                  <div style={{ fontFamily: F, fontSize: '0.74rem', color: '#6b7280', marginTop: '0.2rem', lineHeight: 1.5 }}>
                                    {task.description}
                                  </div>
                                )}
                                <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.3rem' }}>
                                  {new Date(task.scheduled_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                  {task.week_number && ` · Semaine ${task.week_number}`}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── ONGLET CALENDRIER ─── */}
                {activeTab === 'planning' && (
                  <div>
                    {!cycle.ai_calendar ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontFamily: F, fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1rem' }}>
                          Aucun calendrier IA généré. Cliquez sur 🔄 pour lancer l'analyse.
                        </div>
                        <button onClick={() => generateAICalendar(cycle)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.6rem', borderRadius: '2rem', background: '#064e3b', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                          <RefreshCw size={14} /> Générer le planning IA
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* Phases */}
                        {cycle.ai_calendar.length > 0 && (
                          <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem', marginBottom: '0.8rem' }}>📊 Phases de production</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                              {cycle.ai_calendar.map((phase, i) => {
                                const isCurrentPhase = daysSince(cycle.start_date) >= phase.start_day - 1 && daysSince(cycle.start_date) <= phase.end_day;
                                return (
                                  <div key={i} style={{ padding: '1rem 1.2rem', borderRadius: '1.2rem', background: isCurrentPhase ? 'rgba(6,78,59,0.06)' : '#f9f6f0', border: `1.5px solid ${isCurrentPhase ? 'rgba(6,78,59,0.2)' : 'transparent'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.4rem' }}>
                                      {isCurrentPhase && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />}
                                      <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.88rem' }}>{phase.phase}</div>
                                      <span style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af' }}>J{phase.start_day}–J{phase.end_day}</span>
                                      {isCurrentPhase && <span style={{ fontFamily: F, fontSize: '0.62rem', fontWeight: 700, color: '#10b981', marginLeft: 'auto' }}>Phase actuelle</span>}
                                    </div>
                                    <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>{phase.description}</div>
                                    {phase.key_actions && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {phase.key_actions.map((a, j) => (
                                          <span key={j} style={{ padding: '0.2rem 0.6rem', borderRadius: '2rem', background: 'white', border: '1px solid rgba(6,78,59,0.1)', fontFamily: F, fontSize: '0.65rem', color: '#064e3b' }}>{a}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Semaines */}
                        {cycle.ai_weekly_tasks && cycle.ai_weekly_tasks.length > 0 && (
                          <div>
                            <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.9rem', marginBottom: '0.8rem' }}>📅 Planning semaine par semaine</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                              {cycle.ai_weekly_tasks.map((w, i) => {
                                const currentWeek = Math.ceil(daysSince(cycle.start_date) / 7);
                                const isCurrent = w.week === currentWeek;
                                return (
                                  <div key={i} style={{ borderRadius: '1.2rem', overflow: 'hidden', border: `1.5px solid ${isCurrent ? 'rgba(6,78,59,0.2)' : 'rgba(6,78,59,0.06)'}` }}>
                                    <div style={{ padding: '0.7rem 1rem', background: isCurrent ? '#064e3b' : '#f9f6f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.85rem', color: isCurrent ? 'white' : '#064e3b' }}>
                                        Semaine {w.week}{isCurrent ? ' — En cours' : ''} · {w.title}
                                      </span>
                                      {isCurrent && <span style={{ fontFamily: F, fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>MAINTENANT</span>}
                                    </div>
                                    <div style={{ padding: '0.8rem 1rem', background: 'white' }}>
                                      {w.tasks?.map((task, j) => (
                                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.2rem 0', fontFamily: F, fontSize: '0.78rem', color: '#374151' }}>
                                          <ChevronRight size={12} style={{ color: '#10b981', flexShrink: 0, marginTop: '3px' }} />
                                          {task}
                                        </div>
                                      ))}
                                      {w.risks && (
                                        <div style={{ marginTop: '0.5rem', padding: '0.4rem 0.7rem', borderRadius: '0.6rem', background: '#fffbeb', fontFamily: F, fontSize: '0.72rem', color: '#92400e' }}>
                                          ⚠️ <strong>Risque :</strong> {w.risks}
                                        </div>
                                      )}
                                      {w.tips && (
                                        <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.7rem', borderRadius: '0.6rem', background: '#f0fdf4', fontFamily: F, fontSize: '0.72rem', color: '#166534' }}>
                                          💡 {w.tips}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{ marginTop: '1rem', fontFamily: F, fontSize: '0.65rem', color: '#9ca3af', textAlign: 'right' }}>
                          Généré le {cycle.ai_generated_at ? new Date(cycle.ai_generated_at).toLocaleDateString('fr-FR') : '—'}
                          {' · '}
                          <button onClick={() => generateAICalendar(cycle)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#064e3b', fontFamily: F, fontSize: '0.65rem', fontWeight: 700 }}>
                            Régénérer avec météo actuelle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* ══ VUE GLOBALE DES TÂCHES (toutes cultures) ══ */}
      {cycles.length > 1 && (
        <Card style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.8rem' }}>
            <h3 style={{ fontFamily: FH, fontWeight: 800, color: '#064e3b', fontSize: '1rem', margin: 0 }}>
              Vue globale — Toutes les cultures
            </h3>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {(['today', 'week', 'all'] as const).map(f => (
                <button key={f} onClick={() => setTaskFilter(f)}
                  style={{ padding: '0.4rem 0.9rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: '0.68rem', fontWeight: 700,
                    background: taskFilter === f ? '#064e3b' : '#f9f6f0',
                    color: taskFilter === f ? 'white' : '#064e3b' }}>
                  {f === 'today' ? "Aujourd'hui" : f === 'week' ? '7 jours' : 'Tout'}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', fontFamily: F, fontSize: '0.8rem', color: '#9ca3af' }}>
                Aucune tâche pour cette période.
              </div>
            )}
            {filteredTasks.map(task => {
              const meta     = CATEGORY_META[task.category] || CATEGORY_META.autre;
              const cycle    = cycles.find(c => c.id === task.cycle_id);
              const isOverdue = !task.done && new Date(task.scheduled_date) < new Date();
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', borderRadius: '1rem',
                  background: task.done ? '#f9fafb' : meta.bg, opacity: task.done ? 0.5 : 1,
                  border: `1px solid ${isOverdue && !task.done ? '#fca5a5' : 'transparent'}` }}>
                  <button onClick={() => toggleTask(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.done ? '#10b981' : meta.color, padding: 0, flexShrink: 0 }}>
                    {task.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </button>
                  <span style={{ fontSize: '1rem', flexShrink: 0 }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontFamily: F, fontWeight: 600, fontSize: '0.82rem', color: '#064e3b', textDecoration: task.done ? 'line-through' : 'none' }}>
                      {task.title}
                    </span>
                    {cycle && <span style={{ fontFamily: F, fontSize: '0.68rem', color: '#9ca3af', marginLeft: '0.5rem' }}>· {cycle.crop_name}</span>}
                  </div>
                  <span style={{ fontFamily: F, fontSize: '0.65rem', color: isOverdue && !task.done ? '#ef4444' : '#9ca3af', flexShrink: 0 }}>
                    {new Date(task.scheduled_date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
