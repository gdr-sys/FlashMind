# 🧠 FlashMind — Smart Flashcards PWA

<p align="center">
  <strong>A modern, cloud-synced flashcard app with spaced repetition.</strong><br/>
  Built with React, Tailwind CSS, Firebase, and Lucide React. Installable as a PWA.
</p>

---

## ✨ Features

### Core
- **📇 Deck Management** — Create, edit, delete, and color-code your flashcard decks
- **✏️ Card Editor** — Add/edit/delete cards with **Markdown support** (bold, italic, code, lists, headings)
- **🔄 Study Mode** — Tinder-style card flip with swipe gestures and keyboard shortcuts
- **🧠 Spaced Repetition Lite** — SM-2 inspired algorithm that reschedules cards based on your performance:
  - *"Didn't know"* → card is reshown within 1 minute
  - *"So-so"* → moderate interval increase
  - *"Knew it!"* → exponentially growing intervals (1 day → 2.5 days → 6 days → ...)
- **📊 Statistics** — Track your study streaks, accuracy, and card mastery progress
- **📤 Import/Export** — Full JSON export/import of decks for backup and sharing

### Cloud & Auth 🆕
- **🔐 Firebase Authentication** — Sign in with Google or email/password
- **☁️ Cloud Sync** — All your decks and progress sync across devices via Firestore
- **📴 Offline Support** — Works offline with local storage, syncs when back online
- **🔄 Data Migration** — Easily migrate existing local data to the cloud

### UX & Design
- **📱 Mobile-First** — Fully responsive, optimized for smartphones
- **🌙 Dark/Light/System Theme** — Automatic theme detection + manual toggle
- **🌍 Multi-Language** — English, Italian, Spanish, French, German, Portuguese (auto-detects browser language)
- **⚡ PWA** — Installable on any device, works offline
- **🎯 Distraction-Free** — Minimal, clean UI inspired by Anki and modern card-based design
- **⌨️ Keyboard Shortcuts** — Space/Enter to flip, 1/2/3 to answer during study

### Bonus Features
- **🏷️ Tags** — Organize cards with tags for filtering
- **🔍 Search** — Quickly find cards within a deck
- **📈 Mastery Stages** — Cards progress through: New → Learning → Review → Mastered
- **🔥 Study Streak** — Tracks consecutive days of study
- **📊 Mastery Bar** — Visual progress bar showing card stages
- **📋 Markdown Preview** — Live preview toggle in the card editor
- **🎨 Color-coded Decks** — 12 color options for deck organization

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9
- **Firebase project** (free tier is fine)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd flashmind
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable **Google** provider
   - Enable **Email/Password** provider
4. **Create Firestore Database:**
   - Go to Firestore Database → Create database
   - Start in **test mode** (for development)
5. **Get Your Config:**
   - Go to Project Settings → Your apps → Add web app
   - Copy the config values

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Set Up Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production
```bash
npm run build
npm run preview
```

---

## 📦 Deploy on Vercel

### Option 1: One-Click Deploy
1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **"New Project"** → Import your GitHub repo
4. Add environment variables:
   - Add all `VITE_FIREBASE_*` variables from your `.env`
5. Deploy! 🎉

### Option 2: Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

### Post-Deploy Checklist
- [ ] Add your Vercel domain to Firebase Auth → Authorized domains
- [ ] Update Firestore security rules for production
- [ ] Test Google Sign-In on the deployed URL

---

## 🗂️ Project Structure

```
flashmind/
├── public/
│   ├── icons/              # PWA icons (192×192, 512×512)
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx      # Login/Register UI
│   │   ├── BottomNav.tsx       # Tab navigation bar
│   │   ├── CardEditor.tsx      # Card CRUD view
│   │   ├── DeckManager.tsx     # Home view with deck list
│   │   ├── FlashcardViewer.tsx # Study mode with flip & SR
│   │   ├── MarkdownRenderer.tsx# Markdown rendering wrapper
│   │   ├── Modal.tsx           # Reusable modal component
│   │   ├── SettingsView.tsx    # Theme, language, account
│   │   ├── StatsView.tsx       # Statistics dashboard
│   │   └── Toast.tsx           # Toast notifications
│   ├── config/
│   │   └── firebase.ts         # Firebase initialization
│   ├── context/
│   │   └── AppContext.tsx      # Global state + Firebase sync
│   ├── hooks/
│   │   ├── useAuth.ts          # Firebase Auth hook
│   │   ├── useLocalStorage.ts  # Persistent state hook
│   │   ├── useTheme.ts         # Theme management hook
│   │   └── useTranslation.ts   # i18n hook
│   ├── i18n/
│   │   └── translations.ts     # Translation strings (6 languages)
│   ├── services/
│   │   └── firestoreService.ts # Firestore CRUD operations
│   ├── types.ts                # TypeScript type definitions
│   ├── utils/
│   │   ├── id.ts               # UUID generator
│   │   └── spacedRepetition.ts # SR algorithm
│   ├── App.tsx                 # Root component
│   ├── index.css               # Global styles
│   └── main.tsx                # Entry point
├── .env.example                # Environment variables template
├── index.html
├── package.json
├── vite.config.ts
├── README.md
└── DEVELOPMENT.md
```

---

## 🎯 How Spaced Repetition Works

FlashMind uses a **simplified SM-2 algorithm**:

| Answer | Effect |
|--------|--------|
| ❌ Didn't know | Reset streak, 1 min interval, ease -0.3 |
| 🤔 So-so | Keep streak, interval ×1.2, ease -0.1 |
| ✅ Knew it! | Streak +1, interval ×ease, ease +0.15 |

**Card Stages:**
- 🔘 **New** — Never studied
- 🟡 **Learning** — Interval < 1 day
- 🔵 **Review** — Interval 1-21 days
- 🟢 **Mastered** — Interval > 21 days

---

## 🌍 Supported Languages

| Language | Code | Auto-detect |
|----------|------|-------------|
| English  | `en` | ✅ |
| Italiano | `it` | ✅ |
| Español  | `es` | ✅ |
| Français | `fr` | ✅ |
| Deutsch  | `de` | ✅ |
| Português | `pt` | ✅ |

---

## 🔒 Security

- **Firestore Rules** ensure users can only access their own data
- **No sensitive data in frontend** — API keys are safe for client-side Firebase
- **Google OAuth** handles authentication securely
- **Offline data** stored in localStorage (encrypted in transit via HTTPS)

---

## 📄 Import/Export Format

FlashMind uses a JSON format for data portability:

```json
{
  "version": "1.0.0",
  "exportedAt": 1700000000000,
  "decks": [
    {
      "id": "uuid",
      "name": "Spanish Basics",
      "description": "Common Spanish vocabulary",
      "color": "#6366f1",
      "cards": [
        {
          "id": "uuid",
          "front": "**Hola**",
          "back": "Hello / Hi",
          "tags": ["greetings"],
          "sr": { "stage": 0, "ease": 2.5, "interval": 0, "streak": 0, "nextReview": 0 }
        }
      ]
    }
  ]
}
```

---

## 📜 License

MIT License — free for personal and commercial use.

---

<p align="center">
  Made with ❤️ and ☕ — Happy studying! 🎓
</p>
