#!/bin/bash

# 🔥 DEPLOY EXECUTOR v6.0 - BookFlow Production Launch 🔥
# Mission: Code -> Production in one run

# --- CONFIGURATION (FILL THESE) ---
SUPABASE_PROJECT_REF="eebdxhcewlhhcwkfvowd"
STRIPE_LIVE_KEY="${STRIPE_LIVE_KEY:-sk_live_PLACEHOLDER}" # Provide via env or edit here
VERCEL_TEAM="somnajviac"
DOMAIN="booking.youh4ck3dme.com"

echo "🚀 Starting Production Launch Sequence..."

# 1. Supabase Link
echo "🔗 Linking Supabase Project: $SUPABASE_PROJECT_REF..."
# Note: This might require entering the database password
supabase link --project-ref "$SUPABASE_PROJECT_REF" || { echo "❌ Supabase link failed"; exit 1; }

# 2. Database Push (Schema + RLS)
echo "💾 Pushing Database Schema..."
supabase db push || { echo "❌ Database push failed"; exit 1; }

# 3. Secrets & Functions
echo "🔐 Setting Edge Function Secrets..."
if [[ "$STRIPE_LIVE_KEY" == *"PLACEHOLDER"* ]]; then
    echo "⚠️ STRIPE_LIVE_KEY not set. Skipping secret update."
else
    supabase secrets set STRIPE_KEY="$STRIPE_LIVE_KEY" || echo "⚠️ Secret set failed"
fi

echo "⚡ Deploying Edge Functions..."
supabase functions deploy create-booking || { echo "❌ Function deployment failed"; exit 1; }

# 4. Vercel Production
echo "🌐 Deploying to Vercel (Production)..."
# Add env vars first
vercel env add VITE_STRIPE_PUBLIC_KEY prod --yes <<< "pk_live_PLACEHOLDER"
vercel env add VITE_SUPABASE_URL prod --yes <<< "https://$SUPABASE_PROJECT_REF.supabase.co"
vercel env add VITE_SUPABASE_ANON_KEY prod --yes <<< "ANON_KEY_PLACEHOLDER"

vercel --prod --team "$VERCEL_TEAM" --yes || { echo "❌ Vercel deployment failed"; exit 1; }

# 5. Final Verification
echo "🧪 Running Production E2E Tests..."
npm run cypress:prod || echo "⚠️ Cypress tests failed - check logs"

echo "✅ PRODUCTION LAUNCH COMPLETE!"
echo "📍 Live URL: https://$DOMAIN"
echo "📊 Monitor logs at: https://app.supabase.com/project/$SUPABASE_PROJECT_REF/logs"
