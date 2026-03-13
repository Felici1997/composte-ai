import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LocationSelector } from '@/components/LocationSelector';
import { useLocationContext } from '@/contexts/LocationContext';
import { openAIService } from '@/services/openai';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Sparkles, Loader2, Download, Droplets, TrendingUp } from 'lucide-react';

const SoilAnalysis = () => {
  const { selectedLocationName, setLocation, hasLocation, primaryCrops, soilTypes, averageRainfall, bestSeasons } = useLocationContext();
  const [showSelector, setShowSelector] = useState(!hasLocation);
  const [soilPh, setSoilPh] = useState('');
  const [moisture, setMoisture] = useState('');
  const [season, setSeason] = useState('');
  const [budget, setBudget] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState('');
  const { toast } = useToast();

  const seasonOptions = [
    'Grande saison des pluies (oct-déc)',
    'Petite saison des pluies (mars-mai)',
    'Grande saison sèche (juin-sept)',
    'Petite saison sèche (jan-fév)',
  ];

  const handleAnalyze = async () => {
    if (!hasLocation) { toast({ title: 'Localité requise', description: 'Sélectionnez votre localité avant l\'analyse.', variant: 'destructive' }); return; }
    if (!season) { toast({ title: 'Saison requise', description: 'Choisissez la saison en cours.', variant: 'destructive' }); return; }
    setAnalyzing(true);
    setResult('');
    try {
      const soilDesc = soilTypes.length > 0 ? soilTypes.join(', ') : (soilPh ? `pH ${soilPh}` : 'sol local');
      const res = await openAIService.generateCropRecommendation(soilDesc, season, selectedLocationName, budget ? parseInt(budget) : undefined);
      setResult(res);
    } catch(e) {
      toast({ title: 'Erreur', description: 'Impossible de générer l\'analyse.', variant: 'destructive' });
    } finally { setAnalyzing(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Analyse de Sol IA 🌱</h1>
          <p className="text-muted-foreground">Recommandations personnalisées basées sur votre localité et vos données de sol</p>
        </div>

        {/* Barre localisation */}
        <Card className="earth-card p-5 mb-6">
          <div className="flex items-center gap-4">
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-foreground">{hasLocation ? selectedLocationName : 'Aucune localité sélectionnée'}</div>
              {soilTypes.length > 0 && <div className="text-xs text-muted-foreground">Types de sol détectés : {soilTypes.join(', ')}</div>}
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowSelector(!showSelector)}>
              <MapPin className="w-4 h-4 mr-2" />{hasLocation ? 'Changer' : 'Choisir'}
            </Button>
          </div>
        </Card>

        {showSelector && (
          <Card className="earth-card p-6 mb-6">
            <LocationSelector selectedLocation={selectedLocationName} onLocationChange={(n,c,d) => { setLocation(n,c,d); setShowSelector(false); }} showWeather={false} />
          </Card>
        )}

        {/* Profil sol de la zone */}
        {hasLocation && (soilTypes.length > 0 || primaryCrops.length > 0) && (
          <Card className="earth-card p-5 mb-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Profil agricole de {selectedLocationName}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {soilTypes.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Types de sol :</div>
                  <div className="flex flex-wrap gap-1">{soilTypes.map((s,i) => <Badge key={i} variant="outline" className="text-xs capitalize">{s}</Badge>)}</div>
                </div>
              )}
              {primaryCrops.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">Cultures adaptées :</div>
                  <div className="flex flex-wrap gap-1">{primaryCrops.slice(0,4).map((c,i) => <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>)}</div>
                </div>
              )}
              {(averageRainfall || bestSeasons.length > 0) && (
                <div>
                  {averageRainfall && <div className="text-sm text-muted-foreground">💧 {averageRainfall}mm/an</div>}
                  {bestSeasons.length > 0 && <div className="text-xs text-muted-foreground mt-1">📅 {bestSeasons[0]}</div>}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Formulaire d'analyse */}
        <Card className="earth-card p-6 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Droplets className="w-4 h-4 text-primary" />Paramètres de votre sol</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Saison actuelle *</label>
              <Select onValueChange={setSeason}>
                <SelectTrigger><SelectValue placeholder="Choisir la saison..." /></SelectTrigger>
                <SelectContent>{seasonOptions.map((s,i) => <SelectItem key={i} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">pH du sol (optionnel)</label>
              <Input placeholder="Ex: 6.5" value={soilPh} onChange={e => setSoilPh(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Humidité du sol</label>
              <Select onValueChange={setMoisture}>
                <SelectTrigger><SelectValue placeholder="Niveau d'humidité..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">Faible — sol sec</SelectItem>
                  <SelectItem value="moyen">Moyen — sol frais</SelectItem>
                  <SelectItem value="élevé">Élevé — sol humide</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Budget disponible (FCFA)</label>
              <Input placeholder="Ex: 50000" value={budget} onChange={e => setBudget(e.target.value)} type="number" />
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing || !hasLocation} className="w-full">
            {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyse en cours...</> : <><Sparkles className="w-4 h-4 mr-2" />Analyser mon sol</>}
          </Button>
          {!hasLocation && <p className="text-xs text-muted-foreground text-center mt-2">Sélectionnez d'abord votre localité</p>}
        </Card>

        {/* Résultats */}
        {result && (
          <Card className="earth-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Recommandations IA</h3>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(result); toast({ title: 'Copié !' }); }}>
                <Download className="w-4 h-4 mr-2" />Copier
              </Button>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed bg-card-soft p-4 rounded-lg">{result}</pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
export default SoilAnalysis;
