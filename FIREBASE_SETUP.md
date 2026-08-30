# FIREBASE_SETUP.md

Configuration Firebase pour LUMA.

## 1. Créer le projet

1. <https://console.firebase.google.com> → **Ajouter un projet** (`luma`).
2. **Paramètres du projet → Vos applications → Web** : créez une app web et copiez la config.

## 2. Variables d'environnement

Copiez `.env.example` en `.env.local` et renseignez les valeurs de la config web :

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=luma-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=luma-xxxx
VITE_FIREBASE_STORAGE_BUCKET=luma-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Ces valeurs sont publiques par nature : la sécurité repose sur les Security Rules.
Aucune clé privée / credential Admin ne doit être ajoutée au frontend.

## 3. Authentication

**Build → Authentication → Commencer → E-mail/Mot de passe : activer.**
La réinitialisation du mot de passe utilise l'e-mail Firebase (aucune config supplémentaire).

## 4. Cloud Firestore

**Build → Firestore Database → Créer une base** (mode production, région proche).

Structure utilisée par LUMA :

```
users/{userId}                                   uid, email, displayName, searchName, photoURL, bio
conversations/{conversationId}                   participants[2], members{}, lastMessage{}, unread{}, updatedAt
conversations/{conversationId}/messages/{msgId}   text, senderId, readBy[], createdAt
```

L'id d'une conversation privée est déterministe : `uidA__uidB` (uids triés).

### Index

Les requêtes utilisées (`array-contains` + `orderBy updatedAt`) peuvent demander un index
composite : Firestore affiche un lien de création direct dans la console au premier appel.

## 5. Storage (optionnel)

**Build → Storage → Commencer** uniquement si vous ajoutez les avatars/pièces jointes.

## 6. Déployer les règles

```bash
npm i -g firebase-tools
firebase login
firebase init firestore storage   # pointer sur firestore.rules et storage.rules
firebase deploy --only firestore:rules,storage
```

Ou copier/coller le contenu de `firestore.rules` / `storage.rules` dans l'onglet **Rules** de la console.

## 7. IA LUMA (préparation)

Chaîne prévue : `Utilisateur → LUMA → backend sécurisé → API IA → LUMA`.
La clé de l'API IA reste côté serveur (`LUMA_AI_API_KEY`, sans préfixe `VITE_`).
