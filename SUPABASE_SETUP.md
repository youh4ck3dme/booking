
# Supabase Setup Guide

Pre plnú funkčnosť backendu je potrebné vytvoriť projekt v Supabase a aplikovať nasledujúcu schému.

## 1. Vytvorenie Projektu

1. Choď na [database.new](https://database.new)
2. Vytvor nový projekt (napr. "BookFlow Pro")
3. Získaj API kľúče (Project Settings -> API):
   - `URL`
   - `anon` public key

## 2. Environment Variables

Vytvor súbor `.env` (alebo aktualizuj `.env.local`) v roote projektu:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Aplikovanie Schémy

Choď do SQL Editora v Supabase dashboarde a spusti obsah súboru `supabase/schema.sql`.

## 4. Seed Dát

Pre naplnenie databázy úvodnými dátami spusti obsah súboru `supabase/seed.sql` v SQL Editore.

## 5. Auth Konfigurácia

V Authentication -> Providers povoľ "Email".
Vypni "Confirm email" pre dev účely ak chceš rýchle testovanie.
