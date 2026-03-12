// Contexte global de localisation — Composte AI
// Partage la localité sélectionnée dans toute l'application

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Location } from '@/hooks/useLocations';

interface Coordinates {
  lat: number;
  lon: number;
}

interface LocationContextValue {
  // Localité sélectionnée
  selectedLocationName: string;
  selectedCoordinates: Coordinates | null;
  selectedLocationData: Location | null;

  // Setters
  setLocation: (name: string, coords?: Coordinates, data?: Location) => void;
  clearLocation: () => void;

  // Helpers
  hasLocation: boolean;
  departmentName: string;
  primaryCrops: string[];
  soilTypes: string[];
  bestSeasons: string[];
  averageRainfall: number | null;
}

const LocationContext = createContext<LocationContextValue | null>(null);

const STORAGE_KEY = 'composte_ai_location';

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedLocationName, setSelectedLocationName] = useState<string>('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [selectedLocationData, setSelectedLocationData] = useState<Location | null>(null);

  // Restaurer depuis localStorage au démarrage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedLocationName(parsed.name || '');
        setSelectedCoordinates(parsed.coordinates || null);
        setSelectedLocationData(parsed.data || null);
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }, []);

  const setLocation = (name: string, coords?: Coordinates, data?: Location) => {
    setSelectedLocationName(name);
    setSelectedCoordinates(coords || null);
    setSelectedLocationData(data || null);

    // Persister dans localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        name,
        coordinates: coords || null,
        data: data || null
      }));
    } catch {
      // Ignorer les erreurs de stockage
    }
  };

  const clearLocation = () => {
    setSelectedLocationName('');
    setSelectedCoordinates(null);
    setSelectedLocationData(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value: LocationContextValue = {
    selectedLocationName,
    selectedCoordinates,
    selectedLocationData,
    setLocation,
    clearLocation,
    hasLocation: !!selectedLocationName,
    departmentName: selectedLocationData?.department?.name || '',
    primaryCrops: selectedLocationData?.primary_crops || [],
    soilTypes: selectedLocationData?.soil_types || [],
    bestSeasons: selectedLocationData?.best_seasons || [],
    averageRainfall: selectedLocationData?.average_rainfall_mm || null,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext doit être utilisé dans LocationProvider');
  return ctx;
}
