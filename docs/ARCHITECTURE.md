# 🏗️ System Architecture

BookFlow Pro uses a modern, scalable architecture designed for performance, component reuse, and ease of maintenance.

## High-Level Overview

```mermaid
graph TD
    User[User Device] -->|HTTPS/PWA| CDN[Vercel Edge Network]
    CDN -->|Serves| FE[React Frontend]
    FE -->|Data Sync| SB[Supabase (Backend-as-a-Service)]

    subgraph Frontend Logic
        FE -->|State| Z[Zustand Store]
        FE -->|Caching| RQ[React Query]
        FE -->|Routing| RR[React Router]
        FE -->|AI| AI[AI Service Module]
    end

    subgraph Backend Services
        SB -->|Auth| Auth[GoTrue]
        SB -->|DB| PG[PostgreSQL]
        SB -->|Realtime| WS[WebSockets]
    end
```

## Directory Structure

- `src/components`: UI Building blocks.
  - `ui/`: Reusable primitives (Buttons, Inputs, Cards).
  - `layout/`: Structure components (Header, Sidebar, BottomNav).
  - `feature/`: Domain-specific components (BookingForm, EmployeeList).
- `src/pages`: Route-level views. Lazy loaded for performance.
- `src/stores`: Global state management (Zustand).
  - `authStore.ts`: User session and permissions.
  - `uiStore.ts`: Theme, sidebar, notifications.
- `src/services`: External integrations.
  - `aiService.ts`: Chatbot logic and NLP.
  - `supabase.ts`: Database client.
- `src/hooks`: Custom React hooks for logic encapsulation.

## Key Design Patterns

### 1. Store + Service

We verify separation of concerns by keeping API calls in `services` or `hooks`, while global application state resides in `stores`.

- **UI State**: Managed by `useUIStore` (Sidebar open/closed, Theme).
- **Server State**: Managed by `React Query` hooks (`useEmployees`, `useBookings`) to handle caching and loading states.
- **Session State**: Managed by `useAuthStore` (persisted in localStorage).

### 2. PWA Strategy

- **Service Worker**: Uses `vite-plugin-pwa` to generate a SW that caches assets for offline use.
- **Manifest**: Dynamic manifest generation for installability.
- **Offline First**: The UI handles network disconnections gracefully using `navigator.onLine` checks and local optimistic updates where possible.

### 3. AI Integration

The AI service is a deterministic NLP layer that parses user text inputs to detect intents (`booking`, `info`, `reschedule`). It does not rely on external LLM APIs for basic tasks to ensure zero-latency and offline capability.

## Security

- **RLS (Row Level Security)**: All database access is secured at the Postgres level. Users can only see their own data; Admins see all.
- **Env Variables**: All secrets are kept in `.env` files and never committed.
