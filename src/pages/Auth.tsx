import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User } from 'lucide-react';

const F  = "'Poppins', sans-serif";
const FH = "'Outfit', sans-serif";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => { if (session) navigate('/dashboard'); });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: fullName } } });
        if (error) throw error;
        toast({ title: 'Compte créé !', description: 'Vérifiez votre email pour confirmer.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (e: any) { toast({ title: 'Erreur', description: e.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem', borderRadius: '1.2rem', border: '1.5px solid rgba(6,78,59,0.15)', background: 'white', fontFamily: F, fontSize: '0.88rem', color: '#064e3b', outline: 'none' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: F }}>
      {/* LEFT */}
      <div style={{ display: 'none', width: '48%', background: 'linear-gradient(155deg,#022c22 0%,#064e3b 60%,#0a6644 100%)', padding: '3.5rem', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }} className="lg:flex lg:flex-col">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <svg width="42" height="42" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="22" fill="rgba(255,255,255,0.12)"/><path d="M30 50C30 38.95 38.95 30 50 30C61.05 30 70 38.95 70 50" stroke="white" strokeWidth="9" strokeLinecap="round"/><circle cx="50" cy="50" r="9" fill="#10b981"/><path d="M50 50L70 70" stroke="white" strokeWidth="9" strokeLinecap="round"/></svg>
          <span style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.5rem', color: 'white', letterSpacing: '-0.02em' }}>Composte AI</span>
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h2 style={{ fontFamily: FH, fontWeight: 900, fontSize: '3rem', color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
            Cultivez mieux,<br /><span style={{ color: '#a38a5e', fontStyle: 'italic' }}>décidez mieux.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, fontSize: '0.92rem', maxWidth: '26rem' }}>
            L'IA au service des agriculteurs du Congo — recommandations cultures, météo, prix marché en FCFA.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem', marginTop: '2.5rem' }}>
            {['🌱 Cultures IA', '🔬 Maladies', '📈 Marchés FCFA'].map((t, i) => (
              <div key={i} style={{ borderRadius: '1rem', padding: '1rem', textAlign: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontFamily: F, fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 10, fontFamily: F, fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Composte AI · Congo Brazzaville
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1.5rem', background: '#f9f6f0' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Logo mobile */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="22" fill="#064e3b"/><path d="M30 50C30 38.95 38.95 30 50 30C61.05 30 70 38.95 70 50" stroke="white" strokeWidth="9" strokeLinecap="round"/><circle cx="50" cy="50" r="9" fill="#10b981"/><path d="M50 50L70 70" stroke="white" strokeWidth="9" strokeLinecap="round"/></svg>
            <span style={{ fontFamily: FH, fontWeight: 800, fontSize: '1.4rem', color: '#064e3b' }}>Composte AI</span>
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h1 style={{ fontFamily: FH, fontWeight: 900, fontSize: '2.1rem', color: '#064e3b', letterSpacing: '-0.025em', marginBottom: '0.4rem' }}>
              {isSignUp ? 'Créer un compte' : 'Bienvenue 👋'}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.86rem', fontFamily: F }}>
              {isSignUp ? 'Rejoignez la communauté agricole du Congo' : 'Connectez-vous à votre espace agricole'}
            </p>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isSignUp && (
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a38a5e', pointerEvents: 'none' }} />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Votre nom complet" required style={inp} />
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <Mail size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a38a5e', pointerEvents: 'none' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse email" required style={inp} />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a38a5e', pointerEvents: 'none' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (min. 6 car.)" required minLength={6} style={inp} />
            </div>
            <button type="submit" disabled={loading} className="btn-argile"
              style={{ padding: '1rem', fontSize: '0.75rem', borderRadius: '1.2rem', marginTop: '0.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 size={15} className="animate-spin" /> Chargement...</> : (isSignUp ? 'Créer mon compte' : 'Se connecter')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={() => setIsSignUp(!isSignUp)}
              style={{ fontFamily: F, fontSize: '0.82rem', color: '#064e3b', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              {isSignUp ? 'Déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
