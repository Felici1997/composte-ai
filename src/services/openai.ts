// Service IA — Composte AI Congo Brazzaville
import { callAI, getActiveProvider } from './aiProvider';
// Conseils agricoles intelligents en français pour les agriculteurs congolais

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!this.apiKey) {
      console.warn('Clé API OpenAI non trouvée. Utilisation des réponses de secours.');
    }
  }

  async generateCropRecommendation(
    soil: string,
    season: string,
    location: string,
    budget?: number
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackCropRecommendation(soil, season, location, budget);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `Tu es un expert agronome spécialisé dans l'agriculture au Congo Brazzaville. 
Tu conseilles les agriculteurs congolais en français simple et pratique.

Contexte Congo Brazzaville :
- Deux grandes saisons des pluies : octobre-décembre et mars-mai
- Deux saisons sèches : juin-septembre (grande) et janvier-février (petite)
- Cultures principales : manioc, maïs, banane plantain, arachides, légumes, igname, cacao, café, palmier à huile
- Sols : ferralitiques, sablo-argileux, latéritiques, alluvionnaires selon les régions
- Monnaie : FCFA
- Marchés principaux : Brazzaville, Pointe-Noire, marchés de quartier
- Départements : Pool, Bouenza, Niari, Cuvette, Sangha, Likouala, Plateaux, Lékoumou, Kouilou

Directives :
- Parle comme un ami agriculteur expérimenté, pas comme un robot
- Utilise des termes locaux congolais quand pertinent
- Donne des conseils pratiques applicables immédiatement
- Cite des prix en FCFA
- Structure tes réponses clairement avec des emojis
- Termine toujours par une note encourageante`
      },
      {
        role: 'user',
        content: `Recommande-moi des cultures pour :
- Type de sol : ${soil}
- Saison : ${season}
- Localité : ${location}
${budget ? `- Budget disponible : ${budget.toLocaleString()} FCFA` : ''}

Donne des suggestions précises avec les rendements estimés et le potentiel de profit.`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackCropRecommendation(soil, season, location, budget);
    } catch (error) {
      console.error('Erreur API OpenAI:', error);
      return this.getFallbackCropRecommendation(soil, season, location, budget);
    }
  }

  async generatePlantDiseaseAdvice(
    diseaseName: string,
    cropType: string,
    severity: string,
    symptoms: string[]
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackDiseaseAdvice(diseaseName, cropType, severity);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `Tu es un phytopathologiste expert pour l'agriculture au Congo Brazzaville.
Tu diagnostiques les maladies des plantes et conseilles les agriculteurs en français clair.

Contexte Congo Brazzaville :
- Maladies courantes : mosaïque du manioc, anthracnose, rouille, pourriture des racines, cercosporiose bananière
- Traitements disponibles : produits phytosanitaires vendus à Brazzaville et Pointe-Noire
- Remèdes naturels : neem, cendres de bois, extrait de piment, savon noir
- Monnaie : FCFA

Directives :
- Explique le traitement étape par étape comme une recette
- Mentionne les produits disponibles localement au Congo
- Donne des alternatives naturelles et économiques
- Rassure l'agriculteur, sois encourageant
- Indique les délais de guérison estimés`
      },
      {
        role: 'user',
        content: `Maladie détectée :
- Maladie : ${diseaseName}
- Culture : ${cropType}
- Gravité : ${severity}
- Symptômes : ${symptoms.join(', ')}

Donne un traitement complet et des conseils de prévention.`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackDiseaseAdvice(diseaseName, cropType, severity);
    } catch (error) {
      console.error('Erreur API OpenAI:', error);
      return this.getFallbackDiseaseAdvice(diseaseName, cropType, severity);
    }
  }

  async generateFarmingAdvice(query: string, context?: string): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackFarmingAdvice(query);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `Tu es un conseiller agricole expert au Congo Brazzaville, parlant français.
Tu aides les agriculteurs congolais avec des conseils pratiques et adaptés à leur réalité.

Contexte Congo Brazzaville :
- Agriculture principalement vivrière et de subsistance
- Cultures commerciales : manioc, plantain, maraîchage, cacao, café, palmier à huile
- Marchés : Brazzaville (marché Total, Moungali, Mfilou), Pointe-Noire, marchés locaux
- Soutien : Ministère de l'Agriculture du Congo, coopératives agricoles locales
- Monnaie : FCFA

Directives :
- Parle comme un ami agriculteur congolais expérimenté
- Donne des solutions avec les ressources disponibles localement
- Cite les prix en FCFA et les marchés locaux
- Structure avec des emojis pour la lisibilité
- Termine toujours par des encouragements`
      },
      {
        role: 'user',
        content: `${context ? `Contexte : ${context}\n\n` : ''}Question : ${query}`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackFarmingAdvice(query);
    } catch (error) {
      console.error('Erreur API OpenAI:', error);
      return this.getFallbackFarmingAdvice(query);
    }
  }

  async generateWeatherBasedAdvice(
    weather: { temp: number; humidity: number; description: string; windSpeed: number },
    location: string,
    crops: string[]
  ): Promise<string> {
    if (!this.apiKey) {
      return this.getFallbackWeatherAdvice(weather, crops);
    }

    const messages: OpenAIMessage[] = [
      {
        role: 'system',
        content: `Tu es un agronome spécialisé en météorologie agricole au Congo Brazzaville.
Tu analyses les conditions météo et conseilles les agriculteurs congolais en français.

Contexte Congo Brazzaville :
- Climat équatorial et tropical humide
- Température moyenne : 24-28°C
- Humidité élevée : 70-90%
- Risques : inondations en saison des pluies, sécheresse en saison sèche
- Cultures sensibles : manioc, maïs, légumes maraîchers, plantain

Directives :
- Explique la météo avec des mots simples
- Donne des actions concrètes pour aujourd'hui et demain
- Alerte sur les risques spécifiques aux cultures citées
- Conseille sur l'irrigation et le drainage
- Sois pratique et encourageant`
      },
      {
        role: 'user',
        content: `Météo actuelle :
- Localité : ${location}
- Température : ${weather.temp}°C
- Humidité : ${weather.humidity}%
- Conditions : ${weather.description}
- Vent : ${weather.windSpeed} km/h
- Cultures en cours : ${crops.join(', ')}

Donne des recommandations agricoles adaptées à ces conditions.`
      }
    ];

    try {
      const response = await this.callOpenAI(messages);
      return response || this.getFallbackWeatherAdvice(weather, crops);
    } catch (error) {
      console.error('Erreur API OpenAI:', error);
      return this.getFallbackWeatherAdvice(weather, crops);
    }
  }

  private async callOpenAI(messages: OpenAIMessage[]): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API OpenAI: ${response.status} ${response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || null;
  }

  // ── Réponses de secours (sans clé API) ──────────────────────────────────────

  private getFallbackCropRecommendation(soil: string, season: string, location: string, budget?: number): string {
    const isSaisonPluies = season.toLowerCase().includes('pluie') || season.toLowerCase().includes('mars') || season.toLowerCase().includes('octobre');
    const cultures = isSaisonPluies
      ? { principale: 'Manioc', secondaire: 'Maïs', alternative: 'Arachides' }
      : { principale: 'Légumes maraîchers', secondaire: 'Haricots', alternative: 'Amarante' };

    return `🌱 **Recommandations de cultures — ${location}**

Bonjour ! Pour votre sol **${soil}** en **${season}**, voici mes conseils :

**✅ Culture principale recommandée : ${cultures.principale}**
• Très bien adapté à votre sol et à la saison
• Forte demande sur les marchés de Brazzaville et Pointe-Noire
• Rendement estimé : 8 à 15 tonnes/hectare

**🌿 Deuxième choix : ${cultures.secondaire}**
• Moins risqué, rendement fiable
• Cycle court — récolte en 3 mois
• Prix stable au marché local

**💡 Alternative rentable : ${cultures.alternative}**
• Meilleure marge mais plus de travail
• Bon débouché sur les marchés de quartier
${budget ? `\n**💰 Avec ${budget.toLocaleString()} FCFA :** commencez par ${cultures.principale} sur une petite parcelle pour sécuriser votre investissement.` : ''}

**📋 Actions immédiates :**
• Préparez votre sol 2 semaines avant le semis
• Apportez du compost ou de la fumure organique
• Assurez un bon drainage si sol argileux
• Procurez des semences certifiées auprès de l'ANADER

**📈 Potentiel de revenus :** 150 000 à 400 000 FCFA/ha selon la culture et le marché.

Bonne récolte ! 🌾`;
  }

  private getFallbackDiseaseAdvice(diseaseName: string, cropType: string, severity: string): string {
    const urgent = severity === 'severe' || severity === 'sévère' || severity === 'élevée';
    return `🩺 **Traitement : ${diseaseName} sur ${cropType}**

Ne vous inquiétez pas, cette maladie se traite ! Suivez ces étapes :

**🚨 Actions immédiates${urgent ? ' — URGENT, agissez dans les 24h' : ''} :**
1. Retirez et brûlez les feuilles et tiges malades
2. Isolez les plants les plus touchés
3. Arrosez uniquement à la base (plus par le dessus)
4. Améliorez la ventilation entre les plants

**💊 Traitements disponibles au Congo :**
• **Remède naturel :** Extrait de neem — 2 à 3 ml pour 1 litre d'eau, pulvériser chaque semaine
• **Alternative locale :** Cendres de bois mélangées à de l'eau savonneuse
• **Produit du marché :** Fungicide cuivrique — disponible chez les revendeurs agricoles de Brazzaville et Pointe-Noire

**⏱️ Fréquence :** Tous les 7 à 10 jours, surtout en saison des pluies

**Gravité : ${severity}**
${urgent ? '⚠️ **Situation sérieuse — traitez immédiatement pour sauver la récolte**' : '✅ Détecté tôt — guérison complète possible avec traitement régulier'}

**🛡️ Prévention future :**
• Espacez bien vos plants
• Pratiquez la rotation des cultures chaque saison
• Choisissez des variétés résistantes
• Évitez les excès d'arrosage

**Délai de guérison estimé :** 2 à 4 semaines avec un traitement régulier 🌱

Courage, votre récolte peut encore être sauvée !`;
  }

  private getFallbackFarmingAdvice(query: string): string {
    return `🌱 **Conseil agricole — Composte AI**

Bonjour ! Voici ma réponse à votre question : *"${query}"*

**📌 Conseils pour le Congo Brazzaville :**

• **Santé du sol :** Faites une analyse de sol au moins une fois par an. Ajoutez régulièrement du compost ou de la fumure organique pour maintenir la fertilité.

• **Gestion de l'eau :** En saison sèche, arrosez tôt le matin ou en soirée. En saison des pluies, assurez un bon drainage pour éviter la pourriture des racines.

• **Protection des cultures :** Privilégiez les méthodes naturelles (neem, rotation, associations de cultures) avant les produits chimiques.

• **Commercialisation :** Vendez directement au marché quand possible. Les marchés de Brazzaville (Moungali, Total, Mfilou) et de Pointe-Noire offrent de bons prix pour les produits frais.

**🏛️ Ressources disponibles :**
• Ministère de l'Agriculture du Congo — conseils et subventions
• Coopératives agricoles locales — achat groupé d'intrants
• ANADER — semences certifiées et formations

**💡 Prochaines étapes :**
1. Consultez le service agricole de votre département
2. Rejoignez un groupement d'agriculteurs de votre zone
3. Tenez un carnet de suivi de vos cultures et dépenses

Vous êtes sur la bonne voie — l'agriculture congolaise a un bel avenir ! 💪🌿`;
  }

  private getFallbackWeatherAdvice(weather: { temp?: number; humidity?: number }, crops: string[]): string {
    const temp = weather.temp || 26;
    const humidity = weather.humidity || 75;

    return `🌤️ **Conseils météo du jour — Composte AI**

**🌡️ Conditions actuelles :**
• Température : ${temp}°C
• Humidité : ${humidity}%
• Vos cultures : ${crops.join(', ')}

**📋 Actions recommandées aujourd'hui :**
${temp > 30 ? `🔥 **Chaleur élevée (${temp}°C) :**\n• Arrosez tôt le matin (avant 8h) et en soirée (après 17h)\n• Paillez le sol pour conserver l'humidité\n• Évitez tout travail au champ entre 12h et 15h\n\n` : ''}${humidity > 80 ? `💧 **Humidité très élevée (${humidity}%) :**\n• Risque élevé de maladies fongiques\n• Surveillez l'apparition de taches sur les feuilles\n• Aérez bien vos cultures\n• Prévenez avec un traitement au neem si nécessaire\n\n` : ''}${temp < 22 ? `🌬️ **Température fraîche (${temp}°C) :**\n• Réduisez les arrosages\n• Bon moment pour planter des légumes-feuilles\n• Protégez les jeunes plants sensibles\n\n` : ''}${humidity < 55 ? `☀️ **Air sec (${humidity}%) :**\n• Augmentez la fréquence d'arrosage\n• Paillez le sol pour limiter l'évaporation\n• Vérifiez le flétrissement des feuilles\n\n` : ''}
**✅ Tâches du jour :**
• Inspectez vos cultures pour détecter maladies ou ravageurs
• Vérifiez votre système d'arrosage
• Planifiez vos travaux aux heures fraîches
• Consultez les prévisions météo pour les 3 prochains jours

Bonne journée au champ ! 🌾`;
  }
  async generateCropPlanning(params: {
    cropName:     string;
    variety?:     string;
    superficie?:  number;
    durationDays: number;
    nurseryDays:  number;
    startDate:    string;
    tools:        string[];
    workers:      number;
    treatments:   { name: string; type: string; frequency: string }[];
    location:     string;
    weather?:     string;
    forecast?:    string;
  }): Promise<{ phases: any[]; weekly_tasks: any[]; immediate_tasks: any[] } | null> {

    const prompt = `Tu es un agronome expert en agriculture tropicale au Congo Brazzaville.

Génère un planning de production en JSON strict pour :
- Culture : ${params.cropName}${params.variety ? ` (${params.variety})` : ''}
- Superficie : ${params.superficie ? `${params.superficie} m²` : 'non précisée'}
- Durée : ${params.durationDays} jours${params.nurseryDays ? ` (dont ${params.nurseryDays} j. pépinière)` : ''}
- Début : ${params.startDate}
- Outils : ${params.tools.length ? params.tools.join(', ') : 'outils de base'}
- Travailleurs : ${params.workers}
- Traitements : ${params.treatments.length ? params.treatments.map(t => `${t.name} (${t.type}, ${t.frequency})`).join(', ') : 'aucun'}
- Localité : ${params.location}
${params.weather ? `- Météo : ${params.weather}` : ''}
${params.forecast ? `- Prévisions : ${params.forecast}` : ''}

Réponds UNIQUEMENT avec ce JSON valide (sans markdown) :
{"phases":[{"phase":"Nom","start_day":1,"end_day":15,"description":"desc","key_actions":["action1","action2"]}],"weekly_tasks":[{"week":1,"title":"Titre","tasks":["tâche1","tâche2"],"risks":"risque","tips":"conseil"}],"immediate_tasks":[{"day_offset":0,"category":"arrosage","title":"Titre","description":"desc","priority":"normal"}]}

Génère 4+ phases et ${Math.ceil(params.durationDays / 7)} semaines minimum.`;

    try {
      const result = await callAI(prompt, 1500);
      if (!result) return this.getFallbackPlanning(params);
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return this.getFallbackPlanning(params);
      return JSON.parse(jsonMatch[0]);
    } catch {
      return this.getFallbackPlanning(params);
    }
  }

  /** Planning générique quand aucune clé IA n'est configurée */
  private getFallbackPlanning(params: {
    cropName: string; durationDays: number; nurseryDays: number;
    startDate: string;
  }): { phases: any[]; weekly_tasks: any[]; immediate_tasks: any[] } {
    const start = new Date(params.startDate);
    const d = params.durationDays;
    const hasNursery = params.nurseryDays > 0;

    // Phases génériques adaptées à la durée
    const phases = [
      ...(hasNursery ? [{
        phase: 'Pépinière',
        start_day: 1, end_day: params.nurseryDays,
        description: 'Préparation et germination des semences en pépinière.',
        key_actions: ['Préparer les semences', 'Arroser quotidiennement', 'Surveiller la germination'],
      }] : []),
      {
        phase: 'Mise en place',
        start_day: params.nurseryDays + 1, end_day: Math.round(d * 0.15),
        description: 'Préparation du sol, plantation et installation.',
        key_actions: ['Labourer et ameublir le sol', 'Planter ou repiquer', 'Premier arrosage'],
      },
      {
        phase: 'Croissance végétative',
        start_day: Math.round(d * 0.15) + 1, end_day: Math.round(d * 0.5),
        description: 'Développement des feuilles et tiges. Période critique.',
        key_actions: ['Arroser régulièrement', 'Désherber', 'Surveiller les ravageurs'],
      },
      {
        phase: 'Floraison / Fructification',
        start_day: Math.round(d * 0.5) + 1, end_day: Math.round(d * 0.8),
        description: 'Développement des fleurs ou fruits. Fertilisation recommandée.',
        key_actions: ['Fertiliser', 'Réduire l'arrosage progressivement', 'Traitement préventif'],
      },
      {
        phase: 'Maturation et récolte',
        start_day: Math.round(d * 0.8) + 1, end_day: d,
        description: 'Maturité et récolte progressive.',
        key_actions: ['Surveiller la maturité', 'Préparer les contenants', 'Récolter en plusieurs passages'],
      },
    ];

    // Tâches hebdomadaires génériques
    const nbWeeks = Math.ceil(d / 7);
    const weekly_tasks = Array.from({ length: nbWeeks }, (_, i) => {
      const w = i + 1;
      const pct = w / nbWeeks;
      return {
        week: w,
        title: pct < 0.2 ? 'Installation' : pct < 0.5 ? 'Croissance' : pct < 0.8 ? 'Développement' : 'Récolte',
        tasks: [
          pct < 0.3 ? 'Arrosage quotidien le matin' : 'Arrosage tous les 2 jours',
          pct < 0.5 ? 'Désherbage manuel autour des plants' : 'Surveillance des maladies',
          pct > 0.7 ? `Préparer la récolte de ${params.cropName}` : 'Observer la croissance des plants',
        ],
        risks: pct < 0.4 ? 'Fonte des semis si excès d'eau' : pct < 0.7 ? 'Attaque de ravageurs' : 'Pourriture si récolte tardive',
        tips: `Semaine ${w} sur ${nbWeeks} — ${Math.round(pct * 100)}% du cycle accompli`,
      };
    });

    // Tâches immédiates
    const immediate_tasks = [
      { day_offset: 0, category: 'observation', title: `Inspecter la parcelle de ${params.cropName}`, description: 'État du sol, humidité, présence de mauvaises herbes', priority: 'high' },
      { day_offset: 0, category: 'arrosage',    title: 'Premier arrosage', description: 'Arroser en fin d'après-midi pour éviter l'évaporation', priority: 'normal' },
      { day_offset: 1, category: 'désherbage',  title: 'Désherbage initial', description: 'Éliminer les mauvaises herbes avant plantation', priority: 'normal' },
      { day_offset: 2, category: 'observation', title: 'Vérifier la germination', description: 'Observer les premiers signes de croissance', priority: 'normal' },
      { day_offset: 7, category: 'fertilisation', title: 'Premier apport d'engrais', description: 'Engrais de fond si disponible', priority: 'low' },
    ];

    return { phases, weekly_tasks, immediate_tasks };
  }


export const openAIService = new OpenAIService();
