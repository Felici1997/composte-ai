/**
 * useIsMobile.ts
 * Détecte si l'utilisateur est sur mobile (taille écran + user agent)
 */
import { useState, useEffect } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 ||
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        navigator.userAgent
      );
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
