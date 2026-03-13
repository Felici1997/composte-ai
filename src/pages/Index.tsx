import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, ChevronDown,
  Sprout, CloudSun, TrendingUp, Microscope,
  Brain, BarChart3, Droplets, Calendar,
  Users, MapPin, Zap, ArrowRight
} from 'lucide-react';
import CTAFooter from '@/components/CTAFooter';

/* ─── POLICE GLOBALE ─── */
const F = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

/* ─── DONNÉES DES SLIDES ─── */
const slides = [
  {
    id: 'plateforme',
    tag: 'Notre Plateforme',
    title: 'Intelligence agricole\npour le Congo.',
    body: "Composte AI combine l'IA, la météo en temps réel et les données de marché pour aider chaque agriculteur congolais à prendre les meilleures décisions.",
    icon: <Brain size={56} color="#10b981" />,
    bg: '#f9f6f0',
    accent: '#064e3b',
    cards: [
      { icon: <Sprout size={24} />, label: 'Analyse de Sol', desc: 'pH, nutriments, humidité' },
      { icon: <CloudSun size={24} />, label: 'Météo Agricole', desc: 'Prévisions hyperlocales' },
      { icon: <TrendingUp size={24} />, label: 'Prix du Marché', desc: 'Données en temps réel' },
      { icon: <Microscope size={24} />, label: 'Détection Maladies', desc: '94% de précision' },
    ],
  },
  {
    id: 'fonctionnement',
    tag: 'Comment ça marche',
    title: 'Trois étapes vers\nune meilleure récolte.',
    body: "Une expérience simple et guidée pour transformer vos données terrain en recommandations concrètes.",
    icon: <Zap size={56} color="#a38a5e" />,
    bg: '#ffffff',
    accent: '#a38a5e',
    steps: [
      { n: '01', icon: <MapPin size={20} />, title: 'Choisissez votre zone', desc: 'Sélectionnez votre département et localité au Congo.' },
      { n: '02', icon: <Brain size={20} />, title: "L'IA analyse", desc: 'Sol, météo, saisons et marchés sont croisés en quelques secondes.' },
      { n: '03', icon: <Sprout size={20} />, title: 'Cultivez mieux', desc: 'Recevez des recommandations personnalisées avec prédictions de rendement.' },
    ],
  },
  {
    id: 'impact',
    tag: 'Impact & Chiffres',
    title: 'Des résultats\nconcrets sur le terrain.',
    body: "Composte AI accompagne les producteurs du Congo Brazzaville avec des outils qui font vraiment la différence.",
    icon: <BarChart3 size={56} color="#064e3b" />,
    bg: '#f9f6f0',
    accent: '#064e3b',
    stats: [
      { val: '+45%', label: 'Rendement moyen', icon: <TrendingUp size={20} /> },
      { val: '-30%', label: 'Eau économisée', icon: <Droplets size={20} /> },
      { val: '10+', label: 'Départements couverts', icon: <MapPin size={20} /> },
      { val: '24/7', label: 'Assistant IA disponible', icon: <Brain size={20} /> },
    ],
  },
  {
    id: 'temoignages',
    tag: 'Témoignages',
    title: 'La parole aux\nproducteurs congolais.',
    body: "Des agriculteurs de tout le Congo témoignent de l'impact de Composte AI sur leur exploitation.",
    icon: <Users size={56} color="#a38a5e" />,
    bg: '#022c22',
    accent: '#a38a5e',
    dark: true,
    testimonials: [
      { name: 'Jean-Baptiste M.', loc: 'Dolisie, Niari', crop: 'Manioc & Maïs', quote: "Grâce à Composte AI, j'ai augmenté ma récolte de manioc de 40%. Les alertes météo m'ont évité deux mauvaises semaines d'arrosage.", gain: '+40%' },
      { name: 'Cécile K.', loc: 'Owando, Cuvette', crop: 'Banane plantain', quote: "Le scanner de maladies a sauvé toute ma plantation. J'ai détecté la cercosporiose avant qu'elle ne se propage.", gain: 'Plantation sauvée' },
      { name: 'Pierre N.', loc: 'Brazzaville, Pool', crop: 'Légumes & Arachides', quote: "Les prix du marché en temps réel m'ont permis de vendre au bon moment. J'ai gagné 35% de plus cette saison.", gain: '+35% revenus' },
    ],
  },
  {
    id: 'commencer',
    tag: 'Commencez maintenant',
    title: 'Rejoignez l\'agriculture\nconnectée du Congo.',
    body: "Créez votre compte gratuitement et accédez à toutes les fonctionnalités de Composte AI dès aujourd'hui.",
    icon: <Calendar size={56} color="#10b981" />,
    bg: '#064e3b',
    accent: '#a38a5e',
    dark: true,
    ctas: [
      { to: '/auth', label: 'Créer un compte', primary: true },
      { to: '/market', label: 'Voir le marché', primary: false },
      { to: '/soil-analysis', label: 'Analyser mon sol', primary: false },
      { to: '/weather', label: 'Météo agricole', primary: false },
    ],
  },
];

/* ─── COMPOSANT SLIDE ─── */
const Slide = ({ slide, active }: { slide: typeof slides[0]; active: boolean }) => {
  const dark = (slide as any).dark;
  const textColor = dark ? 'white' : slide.accent;
  const subColor = dark ? 'rgba(255,255,255,0.6)' : '#6b7280';

  return (
    <div
      className="w-full flex-shrink-0 min-h-screen flex flex-col justify-center px-6 py-24 transition-opacity duration-500"
      style={{ background: slide.bg, opacity: active ? 1 : 0.4 }}
    >
      <div className="max-w-4xl mx-auto w-full">

        {/* Tag */}
        <div className="mb-8">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{
              fontFamily: F,
              background: dark ? 'rgba(255,255,255,0.08)' : `${slide.accent}14`,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : slide.accent + '28'}`,
              color: dark ? 'rgba(255,255,255,0.7)' : slide.accent,
            }}
          >
            {slide.tag}
          </span>
        </div>

        {/* Titre */}
        <h2
          className="mb-6"
          style={{
            fontFamily: FH,
            fontWeight: 900,
            fontSize: 'clamp(2.2rem, 6vw, 4.5rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: textColor,
            whiteSpace: 'pre-line',
          }}
        >
          {slide.title}
        </h2>

        {/* Body */}
        <p
          className="mb-12 max-w-2xl"
          style={{ fontFamily: F, fontSize: '1.05rem', lineHeight: 1.8, color: subColor }}
        >
          {slide.body}
        </p>

        {/* Contenu spécifique */}

        {/* Cards — plateforme */}
        {(slide as any).cards && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(slide as any).cards.map((c: any, i: number) => (
              <div
                key={i}
                className="p-5 rounded-3xl"
                style={{
                  background: 'white',
                  border: '1px solid rgba(6,78,59,0.08)',
                  boxShadow: '0 4px 20px rgba(6,78,59,0.06)',
                }}
              >
                <div className="mb-3" style={{ color: slide.accent }}>{c.icon}</div>
                <div style={{ fontFamily: FH, fontWeight: 700, fontSize: '0.9rem', color: '#064e3b' }}>{c.label}</div>
                <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Steps — fonctionnement */}
        {(slide as any).steps && (
          <div className="space-y-5">
            {(slide as any).steps.map((s: any, i: number) => (
              <div
                key={i}
                className="flex items-start gap-5 p-5 rounded-3xl"
                style={{ background: '#f9f6f0', border: '1px solid rgba(163,138,94,0.12)' }}
              >
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: slide.accent, fontFamily: FH }}
                >
                  {s.n}
                </div>
                <div>
                  <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontFamily: F, fontSize: '0.85rem', color: '#6b7280' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats — impact */}
        {(slide as any).stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(slide as any).stats.map((s: any, i: number) => (
              <div
                key={i}
                className="p-6 rounded-3xl text-center"
                style={{ background: 'white', border: '1px solid rgba(6,78,59,0.08)', boxShadow: '0 4px 20px rgba(6,78,59,0.06)' }}
              >
                <div style={{ color: slide.accent, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontFamily: FH, fontWeight: 900, fontSize: '1.8rem', color: '#064e3b', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: F, fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Témoignages */}
        {(slide as any).testimonials && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(slide as any).testimonials.map((t: any, i: number) => (
              <div
                key={i}
                className="p-6 rounded-3xl flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <p style={{ fontFamily: F, fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "{t.quote}"
                </p>
                <div className="mt-auto">
                  <div style={{ fontFamily: FH, fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ fontFamily: F, fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{t.loc} · {t.crop}</div>
                  <div
                    className="mt-2 inline-block px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: '#a38a5e', color: 'white', fontFamily: F }}
                  >
                    {t.gain}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTAs */}
        {(slide as any).ctas && (
          <div className="flex flex-wrap gap-4">
            {(slide as any).ctas.map((c: any, i: number) => (
              <Link key={i} to={c.to}>
                <button
                  className={c.primary ? 'btn-argile' : 'btn-outline-white'}
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '0.7rem',
                    ...(c.primary ? {} : { borderColor: 'rgba(255,255,255,0.3)' }),
                  }}
                >
                  {c.label}
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── PAGE PRINCIPALE ─── */
const Index = () => {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const total = slides.length;

  const goTo = (i: number) => {
    const idx = Math.max(0, Math.min(i, total - 1));
    setCurrent(idx);
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: idx * containerRef.current.offsetWidth, behavior: 'smooth' });
    }
  };

  // Sync scroll → current index
  const onScroll = () => {
    if (!containerRef.current) return;
    const idx = Math.round(containerRef.current.scrollLeft / containerRef.current.offsetWidth);
    setCurrent(idx);
  };

  // Touch swipe
  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) goTo(current + (delta > 0 ? 1 : -1));
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: F }}>

      {/* ── HERO ── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #022c22 0%, #064e3b 55%, #0a5f47 100%)' }}
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=2000"
            alt="Agriculture Congo"
            className="w-full h-full object-cover"
            style={{ opacity: 0.15 }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #022c22 0%, transparent 50%, rgba(2,44,34,0.5) 100%)' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="mb-8 fade-in-up">
            <span
              className="inline-block px-6 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.4em]"
              style={{ fontFamily: F, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Soutien Direct aux Producteurs
            </span>
          </div>

          <h1
            className="fade-in-up mb-8"
            style={{
              fontFamily: FH, fontWeight: 900,
              fontSize: 'clamp(3.5rem, 10vw, 8rem)',
              lineHeight: 0.95, letterSpacing: '-0.03em', color: 'white',
              animationDelay: '0.15s',
            }}
          >
            L'agriculture,<br />
            <span style={{ color: '#a38a5e', fontStyle: 'italic' }}>connectée.</span>
          </h1>

          <p
            className="fade-in-up mb-14 mx-auto"
            style={{ fontFamily: F, fontWeight: 500, fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, maxWidth: '42rem', animationDelay: '0.3s' }}
          >
            Composte AI connecte les agriculteurs du Congo Brazzaville aux données, aux marchés et à l'intelligence artificielle pour une agriculture plus juste.
          </p>

          <div className="fade-in-up flex flex-col sm:flex-row gap-5 justify-center" style={{ animationDelay: '0.45s' }}>
            <Link to="/market">
              <button className="btn-argile" style={{ padding: '1.1rem 2.5rem', fontSize: '0.72rem' }}>Accéder au Marché</button>
            </Link>
            <Link to="/auth">
              <button className="btn-outline-white" style={{ padding: '1.1rem 2.5rem', fontSize: '0.72rem' }}>Je suis Producteur</button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-gentle" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <ChevronDown size={36} />
        </div>
      </section>

      {/* ── SLIDES HORIZONTAUX ── */}
      <div className="relative" style={{ background: '#f9f6f0' }}>

        {/* Slider container */}
        <div
          ref={containerRef}
          className="flex overflow-x-auto snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={onScroll}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>
          {slides.map((slide, i) => (
            <div key={slide.id} className="w-full flex-shrink-0 snap-start" style={{ minWidth: '100%' }}>
              <Slide slide={slide} active={current === i} />
            </div>
          ))}
        </div>

        {/* ── NAVIGATION ── */}
        <div
          className="sticky bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-6 py-5"
          style={{ background: 'rgba(249,246,240,0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(163,138,94,0.12)' }}
        >
          {/* Prev */}
          <button
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
            style={{
              background: current === 0 ? 'rgba(163,138,94,0.08)' : '#064e3b',
              color: current === 0 ? '#d1c9bc' : 'white',
              border: 'none',
            }}
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width: current === i ? '2rem' : '0.5rem',
                  height: '0.5rem',
                  background: current === i ? '#064e3b' : '#d1c9bc',
                  border: 'none',
                }}
                title={s.tag}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-all"
            style={{
              background: current === total - 1 ? 'rgba(163,138,94,0.08)' : '#064e3b',
              color: current === total - 1 ? '#d1c9bc' : 'white',
              border: 'none',
            }}
          >
            <ChevronRight size={18} />
          </button>

          {/* Label slide courant */}
          <span
            className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.25em]"
            style={{ fontFamily: F, color: '#9ca3af', minWidth: 120 }}
          >
            {slides[current].tag}
          </span>
        </div>
      </div>

      <CTAFooter />
    </div>
  );
};

export default Index;
