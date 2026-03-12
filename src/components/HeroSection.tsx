import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const HeroSection = () => {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #022c22 0%, #064e3b 55%, #0a5f47 100%)' }}
    >
      {/* Image de fond avec overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fee74a62?auto=format&fit=crop&q=80&w=2000"
          alt="Agriculture Congo"
          className="w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, #022c22 0%, transparent 50%, rgba(2,44,34,0.5) 100%)'
          }}
        />
      </div>

      {/* Contenu centré */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

        {/* Badge tag */}
        <div className="mb-10 fade-in-up" style={{ animationDelay: '0s' }}>
          <span
            className="inline-block px-6 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-[0.4em]"
            style={{
              fontFamily: "'Poppins', sans-serif",
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            Soutien Direct aux Producteurs
          </span>
        </div>

        {/* Titre principal */}
        <h1
          className="fade-in-up mb-8"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(3.5rem, 10vw, 8rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: 'white',
            animationDelay: '0.15s',
          }}
        >
          L'agriculture,{' '}
          <br />
          <span
            style={{
              color: '#a38a5e',
              fontStyle: 'italic',
            }}
          >
            connectée.
          </span>
        </h1>

        {/* Sous-titre */}
        <p
          className="fade-in-up mb-14 mx-auto"
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 500,
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.7,
            maxWidth: '42rem',
            animationDelay: '0.3s',
          }}
        >
          Composte AI connecte les agriculteurs du Congo Brazzaville aux données,
          aux marchés et à l'intelligence artificielle pour une agriculture plus juste.
        </p>

        {/* CTAs */}
        <div
          className="fade-in-up flex flex-col sm:flex-row gap-5 justify-center"
          style={{ animationDelay: '0.45s' }}
        >
          <Link to="/market">
            <button className="btn-argile" style={{ padding: '1.1rem 2.5rem', fontSize: '0.72rem' }}>
              Accéder au Marché
            </button>
          </Link>
          <Link to="/auth">
            <button className="btn-outline-white" style={{ padding: '1.1rem 2.5rem', fontSize: '0.72rem' }}>
              Je suis Producteur
            </button>
          </Link>
        </div>
      </div>

      {/* Flèche scroll */}
      <div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce-gentle"
        style={{ opacity: 0.3 }}
      >
        <ChevronDown size={36} />
      </div>
    </section>
  );
};

export default HeroSection;
