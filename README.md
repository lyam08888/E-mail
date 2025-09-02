# Recrutement Bâtiment – VRD / Hydraulique / CVC (France)

Application web full‑stack pour récupérer des offres d'emploi et les filtrer via IA.

## Fonctionnalités
- UI simple pour rechercher/filtrer (mots clés, localisation, seniority)
- Backend Node.js Express
- Connecteur Adzuna (optionnel) + échantillon local de secours
- Filtrage IA (OpenAI) avec repli heuristique si pas de clé
- Scheduler (CRON) de mise à jour automatique horaire

## Démarrage
1. Installer les dépendances
2. Copier `.env.example` vers `.env` et compléter si disponible
3. Lancer le serveur

### Windows PowerShell
```powershell
# 1) Installer
npm install

# 2) Configurer (optionnel)
Copy-Item .env.example .env
# Puis éditez .env et ajoutez vos clés si besoin

# 3) Lancer
npm run start
# Ouvrez http://localhost:3000
```

## Configuration (.env)
- PORT: port HTTP (défaut 3000)
- OPENAI_API_KEY: clé OpenAI pour le filtrage IA (sinon, filtrage par mots‑clés)
- OPENAI_MODEL: modèle (ex: gpt-4o-mini)
- ADZUNA_APP_ID / ADZUNA_APP_KEY: activer la source Adzuna

## Remarques
- Le stockage est en mémoire (volatil). À remplacer par DB pour la prod.
- Respectez les CGU des sources d'offres.
- Le scraping direct de sites sans API peut être interdit. Préférez des APIs.
