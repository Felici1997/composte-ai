import React, { useState, useRef, useEffect } from 'react';
import { openAIService } from '@/services/openai';
import { useLocationContext } from '@/contexts/LocationContext';
import { LocationSelector } from '@/components/LocationSelector';
import { useToast } from '@/hooks/use-toast';
import { Send, Mic, MicOff, Volume2, VolumeX, MapPin, Bot, User, Sprout, Bug, TrendingUp, Calendar, Droplets, Lightbulb } from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

interface Msg { id: string; text: string; from: 'user' | 'ai'; time: Date; }

const QUICK = [
  { icon: <Sprout size={15} />, txt: 'Quelle culture planter cette saison pour un bon profit ?', color: '#064e3b' },
  { icon: <Bug size={15} />, txt: 'Les feuilles de mes plants jaunissent, que faire ?', color: '#7c2d12' },
  { icon: <Droplets size={15} />, txt: 'Quand et combien arroser mon manioc ?', color: '#1e3a5f' },
  { icon: <TrendingUp size={15} />, txt: 'Quand est le meilleur moment pour vendre mes arachides ?', color: '#4a1942' },
  { icon: <Lightbulb size={15} />, txt: 'Quel engrais utiliser pour la banane plantain ?', color: '#422006' },
  { icon: <Calendar size={15} />, txt: 'Quel travail faire sur mon champ en ce moment ?', color: '#1a2e1a' },
];

const WELCOME = `Bonjour ! 👋 Je suis votre assistant agricole Composte AI.

Je suis ici pour vous aider sur :
🌱 Choix des cultures adaptées à votre zone et saison
🔬 Diagnostic de maladies et parasites
💧 Irrigation, fertilisation, travail du sol
📈 Prix du marché et moment de vente
🌤️ Conseils météo agricoles

Posez votre question en français — je vous réponds immédiatement !`;

export default function AIAssistant() {
  const { selectedLocationName, hasLocation, setLocation } = useLocationContext();
  const [messages, setMessages] = useState<Msg[]>([{ id: '0', text: WELCOME, from: 'ai', time: new Date() }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechOn, setSpeechOn] = useState(false);
  const [showLoc, setShowLoc] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (txt?: string) => {
    const t = (txt || input).trim();
    if (!t) return;
    setInput('');
    const userMsg: Msg = { id: Date.now().toString(), text: t, from: 'user', time: new Date() };
    setMessages(p => [...p, userMsg]);
    setTyping(true);
    try {
      const q = t.toLowerCase();
      let resp = '';
      if (q.includes('culture') || q.includes('planter') || q.includes('recommand')) {
        resp = await openAIService.generateCropRecommendation('mixte', 'saison en cours', selectedLocationName || 'Congo', undefined);
      } else if (q.includes('maladie') || q.includes('jauniss') || q.includes('feuille') || q.includes('parasite')) {
        resp = await openAIService.generatePlantDiseaseAdvice('symptômes inconnus', 'culture générale', 'modéré', [t]);
      } else if (q.includes('météo') || q.includes('pluie') || q.includes('arros')) {
        resp = await openAIService.generateWeatherBasedAdvice({ temp: 28, humidity: 72, description: 'nuageux', windSpeed: 10 }, selectedLocationName || 'Congo', ['manioc', 'maïs']);
      } else {
        resp = await openAIService.generateFarmingAdvice(t, selectedLocationName);
      }
      const aiMsg: Msg = { id: (Date.now() + 1).toString(), text: resp, from: 'ai', time: new Date() };
      setMessages(p => [...p, aiMsg]);
      if (speechOn && 'speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(resp); u.lang = 'fr-FR'; u.rate = 0.85;
        window.speechSynthesis.speak(u);
      }
    } catch {
      setMessages(p => [...p, { id: Date.now().toString(), text: 'Désolé, une erreur est survenue. Réessayez.', from: 'ai', time: new Date() }]);
    } finally { setTyping(false); }
  };

  const startListen = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast({ title: 'Microphone non supporté', variant: 'destructive' }); return; }
    const r = new SR(); r.lang = 'fr-FR'; r.interimResults = false;
    r.onstart = () => setListening(true);
    r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
  };

  const s = (t: string) => ({ fontFamily: F, fontSize: t });

  return (
    <div style={{ minHeight: '100vh', background: '#f9f6f0', fontFamily: F, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(160deg,#022c22 0%,#064e3b 100%)', paddingTop: '6rem', paddingBottom: '2rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', flexShrink: 0 }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '1rem', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.4rem', color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>Assistant IA</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ ...s('0.7rem'), color: 'rgba(255,255,255,0.55)' }}>{typing ? 'En train de répondre…' : 'En ligne'}</span>
              </div>
            </div>
          </div>

          {/* Localité + sons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button onClick={() => setShowLoc(!showLoc)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
              <MapPin size={13} color="#10b981" />
              <span style={{ ...s('0.72rem'), color: hasLocation ? 'white' : 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                {hasLocation ? selectedLocationName : 'Ma zone'}
              </span>
            </button>
            <button onClick={() => setSpeechOn(!speechOn)}
              style={{ padding: '0.5rem', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', color: speechOn ? '#10b981' : 'rgba(255,255,255,0.4)' }}>
              {speechOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {showLoc && (
          <div style={{ maxWidth: '860px', margin: '1rem auto 0', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <LocationSelector selectedLocation={selectedLocationName} onLocationChange={(n, c, d) => { setLocation(n, c, d); setShowLoc(false); }} showWeather={false} />
          </div>
        )}
      </div>

      {/* Chat + sidebar */}
      <div style={{ flex: 1, maxWidth: '860px', width: '100%', margin: '0 auto', padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }} className="lg:grid-cols-[1fr_220px]">
        {/* Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '2rem', overflow: 'hidden', border: '1px solid rgba(6,78,59,0.07)', boxShadow: '0 2px 20px rgba(6,78,59,0.05)', minHeight: '60vh' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', gap: '0.6rem', alignItems: 'flex-end' }}>
                {m.from === 'ai' && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '0.7rem', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '0.2rem' }}>
                    <Bot size={15} color="white" />
                  </div>
                )}
                <div style={{ maxWidth: '80%' }}>
                  <div style={{ padding: '0.9rem 1.2rem', borderRadius: m.from === 'user' ? '1.2rem 1.2rem 0.3rem 1.2rem' : '1.2rem 1.2rem 1.2rem 0.3rem',
                    background: m.from === 'user' ? '#064e3b' : '#f9f6f0',
                    color: m.from === 'user' ? 'white' : '#1f2937',
                    fontFamily: F, fontSize: '0.85rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {m.text}
                  </div>
                  <div style={{ fontFamily: F, fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.3rem', textAlign: m.from === 'user' ? 'right' : 'left' }}>
                    {m.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                {m.from === 'user' && (
                  <div style={{ width: '30px', height: '30px', borderRadius: '0.7rem', background: '#a38a5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '0.2rem' }}>
                    <User size={15} color="white" />
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '0.7rem', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={15} color="white" />
                </div>
                <div style={{ padding: '0.9rem 1.2rem', borderRadius: '1.2rem 1.2rem 1.2rem 0.3rem', background: '#f9f6f0', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {[0, 0.15, 0.3].map((d, i) => (
                    <div key={i} className="animate-bounce" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#9ca3af', animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(6,78,59,0.08)', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Posez votre question en français…"
              style={{ flex: 1, padding: '0.8rem 1.1rem', borderRadius: '1.2rem', border: '1.5px solid rgba(6,78,59,0.12)', background: '#f9f6f0', fontFamily: F, fontSize: '0.86rem', color: '#064e3b', outline: 'none' }} />
            <button onClick={startListen} disabled={listening}
              style={{ padding: '0.8rem', borderRadius: '50%', border: 'none', background: listening ? '#fee2e2' : '#f9f6f0', cursor: 'pointer', display: 'flex', color: listening ? '#ef4444' : '#9ca3af' }} className={listening ? 'animate-pulse' : ''}>
              {listening ? <Mic size={17} /> : <MicOff size={17} />}
            </button>
            <button onClick={() => send()} disabled={!input.trim() || typing}
              style={{ padding: '0.8rem 1.3rem', borderRadius: '1.2rem', border: 'none', background: input.trim() && !typing ? '#064e3b' : '#e5e7eb', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={16} color={input.trim() && !typing ? 'white' : '#9ca3af'} />
            </button>
          </div>
        </div>

        {/* Actions rapides — sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontFamily: FH, fontWeight: 700, color: '#064e3b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Questions fréquentes</div>
          {QUICK.map((q, i) => (
            <button key={i} onClick={() => send(q.txt)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', padding: '0.85rem', borderRadius: '1.1rem', background: 'white', border: '1px solid rgba(6,78,59,0.08)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#064e3b')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(6,78,59,0.08)')}>
              <div style={{ width: '28px', height: '28px', borderRadius: '0.7rem', background: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white' }}>{q.icon}</div>
              <span style={{ fontFamily: F, fontSize: '0.72rem', color: '#374151', lineHeight: 1.5 }}>{q.txt}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
