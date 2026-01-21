# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-21

### 🚀 Released
- **Full Production Release**: The BookFlow Pro platform (PWA, API, Plugin) is now version 1.0.0.

### ✨ Features
- **Progressive Web App (PWA)**:
    - Complete offline support with Service Workers.
    - "Add to Home Screen" capability.
    - Mobile-optimized UI with "Glassmorphism" design.
    - Notification support (with iOS safety checks).
- **Backend API (`/api`)**:
    - Express.js + TypeScript server.
    - Endpoints for Services, Employees, Slots, and Bookings.
    - `X-BookFlow-API-Key` authentication.
- **WordPress Integration**:
    - `bookflow-pro` plugin updated to 1.0.0.
    - Seamless communication with the Backend API.
- **Testing**:
    - Comprehensive Playwright E2E suite (Desktop Chrome, Mobile Chrome, Mobile Safari).
    - Unit tests for Hooks and Components.

### 🐛 Fixes
- **Mobile Safari**: Fixed critical crash in `Dashboard.tsx` related to the Notification API.
- **E2E Stability**: Resolved flakiness in booking flows and chatbot tests.
- **Build**: Fixed TypeScript errors in production build (`useBookings.ts`).
