// Hook React — Chargement des localités et départements depuis Supabase
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  name: string;
  code: string;
  primary_crops: string[];
  soil_type: string | null;
  rainfall_range: string | null;
  irrigation_level: string | null;
  speciality: string | null;
}

export interface Location {
  id: string;
  name: string;
  department_id: string;
  latitude: number;
  longitude: number;
  is_popular: boolean;
  primary_crops: string[];
  soil_types: string[];
  average_rainfall_mm: number | null;
  best_seasons: string[];
  irrigation_availability: string | null;
  market_access: string | null;
  agri_infrastructure: string | null;
  special_features: string[];
  department?: Department;
}

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Charger les départements
        const { data: depts, error: deptsError } = await supabase
          .from('departments')
          .select('*')
          .order('name');

        if (deptsError) throw deptsError;

        // Charger les localités avec leur département
        const { data: locs, error: locsError } = await supabase
          .from('locations')
          .select(`
            *,
            department:departments(*)
          `)
          .order('is_popular', { ascending: false })
          .order('name');

        if (locsError) throw locsError;

        setDepartments(depts || []);
        setLocations(locs || []);
      } catch (err: any) {
        console.error('Erreur chargement localités:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Recherche par nom, département ou culture
  function searchLocations(query: string): Location[] {
    if (!query.trim()) return locations;
    const q = query.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(q) ||
      loc.department?.name.toLowerCase().includes(q) ||
      loc.primary_crops.some(c => c.toLowerCase().includes(q))
    );
  }

  // Trouver une localité par nom
  function findLocation(name: string): Location | null {
    return locations.find(loc =>
      loc.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(loc.name.toLowerCase())
    ) || null;
  }

  return { locations, departments, loading, error, searchLocations, findLocation };
}
