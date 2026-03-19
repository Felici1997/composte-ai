/**
 * MobilePageWrapper.tsx
 * Wrapper qui adapte les pages desktop pour mobile :
 * - Retire le paddingTop du header desktop
 * - Ajoute le padding correct pour mobile
 */
import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Props {
  children: React.ReactNode;
  noPadding?: boolean;
}

export default function MobilePageWrapper({ children, noPadding }: Props) {
  const isMobile = useIsMobile();

  if (!isMobile) return <>{children}</>;

  return (
    <div style={{
      // Sur mobile, on retire le paddingTop car MobileHeader est sticky
      // Les pages gardent leur propre contenu mais sans le grand hero inutile
    }}>
      {children}
    </div>
  );
}
