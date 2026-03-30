
# 🌱 Système de recommandation de cultures alimenté par l’IA

Une plateforme intelligente qui aide les agriculteurs à prendre des **décisions plus éclairées et basées sur les données** en fournissant des **recommandations personnalisées de cultures, des prévisions de rendement et des analyses de marché** grâce à **l’IA, Supabase et des API en temps réel**.

---

## 📌 Fonctionnalités

* ✅ **Recommandations de cultures par IA** – Propose les cultures les plus adaptées en fonction du sol, du climat et de l’historique agricole.
* ✅ **Prévision des rendements et des profits** – Estime les rendements attendus et les marges bénéficiaires.
* ✅ **Analyse en temps réel du climat et du sol** – Récupère les données via des API et des sources IoT.
* ✅ **Intégration du marché** – Connexion avec e-NAM et Agmarknet pour obtenir des informations sur les prix et la demande.
* ✅ **Support multilingue et vocal** – Assistance en langues locales + commande vocale pour plus d’accessibilité.
* ✅ **Fonctionnement hors ligne** – Utilisable dans les zones à faible ou sans connexion Internet.

---

## 🛠️ Stack technique

* **Frontend** : React + TailwindCSS
* **Backend** : Supabase (PostgreSQL + Authentification + intégration d’API)
* **Base de données** : Supabase (PostgreSQL hébergé dans le cloud)
* **Modèles IA/ML** : Python (scikit-learn, TensorFlow) / Edge Functions
* **APIs intégrées** :

  * 🌦️ API météo (OpenWeather / IMD)
  * 🌱 Données du sol (SoilGrids / capteurs IoT)
  * 📊 Prix du marché (e-NAM, Agmarknet)

---

## 🚀 Fonctionnement

1. **Entrée** – L’agriculteur saisit le type de sol, le pH, la localisation et les informations d’irrigation.
2. **Traitement** – Supabase stocke les données → le modèle IA analyse les entrées + météo + données du sol.
3. **Sortie** – L’agriculteur reçoit des recommandations avec :

   * 📊 Score d’adéquation
   * 🌾 Rendement estimé
   * 💰 Estimation des profits
   * ✅ Avantages & ⚠ Risques
4. **Aide à la décision** – Accès à des plans de culture détaillés et à des informations de marché.

---

## 📂 Installation du projet

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/your-username/agri-vision-ai.git
cd agri-vision-ai
```

### 2️⃣ Installer les dépendances

```bash
npm install
```

### 3️⃣ Configurer Supabase

* Créer un projet sur Supabase
* Récupérer les clés API (URL + clé publique/anon)
* Les ajouter dans un fichier `.env.local` :

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENWEATHER_API_KEY=your-weather-api-key
```

### 4️⃣ Lancer le serveur de développement

```bash
npm run dev
```

Le projet sera accessible sur : **[http://localhost:5173/](http://localhost:5173/)** 🎉

---

## 🌍 Impact et avantages

* 📈 Augmente la **productivité agricole** et les revenus
* 🌱 Favorise des **pratiques agricoles durables**
* 🔔 Réduit les risques liés à la **météo et au marché**
* 🤝 Rend l’IA accessible aux agriculteurs grâce au **support vocal et multilingue**

---

## 📊 Faisabilité et défis

* **Faisabilité** : Facilement scalable avec Supabase (serverless + PostgreSQL hébergé)
* **Défis** : Connectivité Internet, adoption technologique par les agriculteurs
* **Stratégies** : Approche offline-first, support multilingue, formation communautaire

---

## 📚 Références

* Documentation Supabase
* API OpenWeather
* Données SoilGrids
* e-NAM (Marché Agricole National)
* Agmarknet

---

## 👨‍💻 Équipe

* Nom de l’équipe : **Composte AI** 🌾

Si tu veux, je peux aussi te proposer une **structure de dossier professionnelle pour ce projet (frontend + backend + IA)** 👍
