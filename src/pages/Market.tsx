import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LocationSelector } from '@/components/LocationSelector';
import { useLocationContext } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, MapPin, RefreshCw, Bell, BarChart3, Loader2 } from 'lucide-react';

// Prix de marché par culture et localité (FCFA/kg)
const marketPrices: Record<string, { price: number; change: number; unit: string; market: string }> = {
  'Manioc':           { price: 150,   change: 2.1,  unit: 'kg',    market: 'Marché Moungali' },
  'Maïs':             { price: 350,   change: -1.5, unit: 'kg',    market: 'Marché Total' },
  'Banane plantain':  { price: 500,   change: 4.3,  unit: 'régime',market: 'Marché Mfilou' },
  'Arachides':        { price: 800,   change: 1.8,  unit: 'kg',    market: 'Marché Central' },
  'Légumes':          { price: 400,   change: 3.2,  unit: 'kg',    market: 'Marché Bacongo' },
  'Igname':           { price: 600,   change: -0.8, unit: 'kg',    market: 'Marché Ouenzé' },
  'Cacao':            { price: 2500,  change: 5.1,  unit: 'kg',    market: 'Exportateur Brazzaville' },
  'Café':             { price: 2200,  change: 2.7,  unit: 'kg',    market: 'Coopérative Sibiti' },
  'Palmier à huile':  { price: 900,   change: 1.2,  unit: 'litre', market: 'Huilerie Niari' },
  'Canne à sucre':    { price: 120,   change: 0.5,  unit: 'kg',    market: 'SARIS Congo' },
};

const Market = () => {
  const { selectedLocationName, setLocation, hasLocation, primaryCrops, departmentName } = useLocationContext();
  const [showSelector, setShowSelector] = useState(!hasLocation);
  const [searchCrop, setSearchCrop] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Cultures à afficher : celles de la localité + toutes si pas de localité
  const displayCrops = primaryCrops.length > 0
    ? primaryCrops.filter(c => marketPrices[c])
    : Object.keys(marketPrices);

  const filteredCrops = displayCrops.filter(c =>
    c.toLowerCase().includes(searchCrop.toLowerCase())
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
      toast({ title: 'Prix mis à jour', description: `Données actualisées pour ${selectedLocationName || 'le Congo'}` });
    }, 1200);
  };

  const formatTime = (d: Date) => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Marché Agricole 📈</h1>
          <p className="text-muted-foreground">Prix des cultures selon votre localité au Congo Brazzaville</p>
        </div>

        {/* Barre localisation */}
        <Card className="earth-card p-5 mb-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">{hasLocation ? selectedLocationName : 'Aucune localité sélectionnée'}</div>
              {departmentName && <div className="text-xs text-muted-foreground">Département : {departmentName}</div>}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSelector(!showSelector)}>
              <MapPin className="w-4 h-4 mr-2" />{hasLocation ? 'Changer' : 'Choisir'}
            </Button>
          </div>
        </Card>

        {showSelector && (
          <Card className="earth-card p-6 mb-6 max-w-4xl mx-auto">
            <LocationSelector selectedLocation={selectedLocationName} onLocationChange={(n,c,d) => { setLocation(n,c,d); setShowSelector(false); }} showWeather={false} />
          </Card>
        )}

        {!hasLocation ? (
          <Card className="earth-card p-12 text-center max-w-xl mx-auto">
            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Choisissez votre localité</h3>
            <p className="text-muted-foreground mb-4">Les prix affichés seront filtrés selon les cultures de votre zone.</p>
            <Button onClick={() => setShowSelector(true)}><MapPin className="w-4 h-4 mr-2" />Choisir ma localité</Button>
          </Card>
        ) : (
          <>
            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input placeholder="Rechercher une culture..." value={searchCrop} onChange={e => setSearchCrop(e.target.value)} className="w-full" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Mis à jour : {formatTime(lastUpdated)}</span>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
              </div>
            </div>

            {/* Résumé de la zone */}
            <Card className="earth-card p-5 mb-6 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">🌍</span>
                <h3 className="font-semibold text-foreground">Zone : {selectedLocationName}</h3>
                {departmentName && <Badge variant="secondary">{departmentName}</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                {primaryCrops.length > 0
                  ? `${primaryCrops.length} cultures identifiées dans votre zone — prix filtrés en conséquence.`
                  : 'Toutes les cultures sont affichées.'}
              </p>
            </Card>

            {/* Grille des prix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredCrops.map((crop, i) => {
                const info = marketPrices[crop];
                if (!info) return null;
                const isUp = info.change >= 0;
                return (
                  <Card key={i} className="earth-card p-5 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{crop}</h3>
                        <div className="text-xs text-muted-foreground">{info.market}</div>
                      </div>
                      <Badge variant={isUp ? 'default' : 'destructive'} className="flex items-center gap-1">
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? '+' : ''}{info.change}%
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {info.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA/{info.unit}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast({ title: `Alerte prix — ${crop}`, description: `Vous serez notifié si le prix dépasse ${(info.price * 1.1).toFixed(0)} FCFA/${info.unit}` })}>
                        <Bell className="w-3 h-3 mr-1" /> Alerte
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <BarChart3 className="w-3 h-3 mr-1" /> Historique
                      </Button>
                    </div>
                  </Card>
                );
              })}
              {filteredCrops.length === 0 && (
                <div className="col-span-3 text-center py-10 text-muted-foreground">
                  Aucune culture trouvée pour "{searchCrop}" dans votre zone.
                </div>
              )}
            </div>

            {/* Tendances */}
            <Card className="earth-card p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Tendances du marché local
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Culture en hausse', value: displayCrops.filter(c => (marketPrices[c]?.change||0)>0).length, icon: '📈', color: 'text-green-600' },
                  { label: 'Culture en baisse', value: displayCrops.filter(c => (marketPrices[c]?.change||0)<0).length, icon: '📉', color: 'text-red-600' },
                  { label: 'Cultures suivies', value: filteredCrops.length, icon: '🌱', color: 'text-primary' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-4 bg-card-soft rounded-xl">
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};
export default Market;
