# 🚀 BookFlow Pro - Enterprise Booking System PWA

> **Moderný, nadčasový rezervačný systém pre firmy budúcnosti.**
> Postavený na technológiách React 19, TypeScript, Vite a PWA.

![BookFlow Pro Banner](https://placehold.co/1200x400/0f0f23/6366f1?text=BookFlow+Pro)

## 📋 Prehľad projektu

**BookFlow Pro** je progresívna webová aplikácia (PWA) navrhnutá pre maximálnu rýchlosť, offline dostupnosť a prémiový užívateľský zážitok.

### 🌟 Kľúčové Vlastnosti

- **📱 PWA First:** Inštalovateľná aplikácia, funguje offline, push notifikácie.
- **🎨 Premium Dizajn:** Glassmorphism, plynulé animácie, dark/light mode.
- **🤖 AI Chatbot:** Integrovaný asistent pre rezervácie v prirodzenom jazyku.
- **⚡ Superrýchla:** Postavená na Vite a optimalizovaná pre Core Web Vitals.
- **📊 Smart Dashboard:** Real-time analytika a správa rezervácií.

---

## 🚀 Rýchly Štart

### Prerekvizity

- Node.js (LTS verzia)
- pnpm (`npm install -g pnpm`)

### Inštalácia & Spustenie

1. **Inštalácia závislostí:**

   ```bash
   pnpm install
   ```

2. **Spustenie vývojového servera:**

   ```bash
   pnpm dev
   ```

   Aplikácia beží na `http://localhost:5173/`

3. **Spustenie testov:**

   ```bash
   pnpm test:ui  # Otvorí Vitest UI
   pnpm test     # Spustí testy v konzole
   ```

### 🔐 Demo Účty

Pre testovanie funkcionality použite tieto predpripravené účty:

| Rola            | Email                    | Heslo      | Popis                                   |
| :-------------- | :----------------------- | :--------- | :-------------------------------------- |
| **Admin**       | `admin@bookflow.sk`      | `admin123` | Plný prístup k nastaveniam a dashboardu |
| **Zamestnanec** | `employee@bookflow.sk`   | `emp123`   | Správa vlastného kalendára              |
| **Zákazník**    | `customer@example.com`   | `cust123`  | Vytváranie a prehľad rezervácií         |

---

## 🏗️ Technická Architektúra

### Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand (s persistenciou)
- **Data Fetching:** TanStack Query
- **Styling:** CSS Variables, Glassmorphism design system
- **Animations:** Framer Motion
- **PWA:** Vite PWA Plugin, Workbox
- **Testing:** Vitest, React Testing Library

### Štruktúra Priečinkov

```bash
src/
├── components/     # UI a funkčné komponenty
│   ├── ui/         # Základné stavebné bloky (Button, Input, Card...)
│   ├── layout/     # Header, Footer, Sidebar
│   ├── booking/    # Komponenty rezervačného procesu
│   ├── chat/       # AI Chatbot widget
│   └── dashboard/  # Admin a employee dashboardy
├── pages/          # Hlavné stránky (Home, Login, Book...)
├── stores/         # Zustand stores (auth, booking, ui)
├── hooks/          # Custom React hooks
├── services/       # API služby a logika
├── types/          # TypeScript definície
└── utils/          # Pomocné funkcie
```

---

## 📚 Dokumentácia

### 1. Booking Flow

Proces rezervácie je rozdelený do krokov:

1. **Výber služby:** Zoznam dostupných služieb s cenami a trvaním.
2. **Výber zamestnanca:** (Voliteľné) Preferovaný špecialista.
3. **Výber termínu:** Interaktívny kalendár s voľnými slotmi.
4. **Zhrnutie & Potvrdenie:** Kontrola údajov a odoslanie.

### 2. AI Chatbot (Coming Soon)

Chatbot využíva OpenAI API na:

- Analýzu požiadavky ("Chcem sa ostrihať zajtra o 14:00")
- Kontrolu dostupnosti
- Vytvorenie rezervácie cez konverzáciu

### 3. PWA Schopnosti

- **Service Worker:** Cachovanie assetov a API requestov.
- **Manifest:** Definícia ikon, farieb a správania "Add to Home Screen".
- **Offline Mode:** Fallback UI pri strate spojenia.

---

## 🧪 Testovacia Stratégia

Projekt kladie dôraz na kvalitu kódu. Plánujeme implementovať **120+ testov** v nasledujúcich kategóriách:

### Unit Testy (40+)

- Testovanie úžitkových funkcií (date formatting, calculations).
- Validácia logiky Zustand stores.
- Testovanie validátorov formulárov.

### Component Testy (40+)

- Renderovanie UI komponentov v rôznych stavoch (loading, error, success).
- Interakcie (kliky, input events).
- Prístupnosť (a11y).

### Integration Testy (40+)

- Celý proces rezervácie (E2E flow).
- Prihlásenie a presmerovanie.
- PWA cyklus (offline/online).

---

## 🛠️ Vývojový Plán

- [x] **Fáza 1:** Setup projektu, Dizajn systém, Auth.
- [ ] **Fáza 2:** Booking Flow (Kalendár, Slot picker).
- [ ] **Fáza 3:** AI Chatbot integrácia.
- [ ] **Fáza 4:** Dashboard a Analytics.
- [ ] **Fáza 5:** Komplexné testovanie a optimalizácia.

---

*Vytvorené s ❤️ pre BookFlow Pro.*
