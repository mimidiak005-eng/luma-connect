# LUMA

Messagerie de l'écosystème **Lumesys** : conversations privées, messages en temps réel,
statuts lu/non lu, profil, paramètres et mode clair/sombre.

## Stack

React 19 + TypeScript (TanStack Start / Vite), CSS séparé, Firebase Authentication,
Cloud Firestore (temps réel), Firebase Storage (optionnel).

## Démarrer

```bash
npm install
cp .env.example .env.local   # renseigner les variables VITE_FIREBASE_*
npm run dev
```

Configuration Firebase détaillée : [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## Structure

```
src/
├── firebase/config.ts            initialisation du SDK Firebase
├── services/                     authService, userService, conversationService, messageService
├── hooks/                        useAuth (session), useTheme (clair/sombre)
├── utils/format.ts               dates, heures, initiales
├── styles/luma.css               identité visuelle LUMA
├── components/luma/              Brand, RequireAuth
└── routes/                       / (accueil), /auth, /chat, /profile, /settings
firestore.rules                   sécurité Firestore (deny by default)
storage.rules                     sécurité Storage
```

## Sécurité

- Aucun mot de passe n'est stocké dans Firestore (Firebase Auth uniquement).
- Firestore : refus par défaut, accès limité à ses propres données et aux conversations
  dont on est membre, impossibilité de s'attribuer un rôle admin.
- Aucun secret dans le dépôt : `.env.local` est ignoré, seul `.env.example` est versionné.

## Fait / à venir

Fait : inscription, connexion, déconnexion, mot de passe oublié, pages protégées,
recherche d'utilisateur, conversations privées, messages temps réel, non lus + statut lu,
profil, paramètres, thème clair/sombre, règles de sécurité, responsive.

À venir : avatars (Storage), pièces jointes, indicateur de saisie, notifications push,
groupes, IA LUMA (architecture déjà prévue, clé API côté serveur uniquement).
