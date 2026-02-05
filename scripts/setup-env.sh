#!/bin/bash
# Setup Vercel env vars from Keychain - no passwords in logs

set -e
cd "$(dirname "$0")/.."

echo "🔧 Setting up Vercel environment variables..."

# Helper function to set env var from keychain
set_env_from_keychain() {
    local env_name="$1"
    local keychain_key="$2"
    local environments="$3"
    
    # Get value from keychain (suppress output)
    local value
    value=$(security find-generic-password -s "$keychain_key" -w 2>/dev/null) || {
        echo "❌ Failed to get $keychain_key from Keychain"
        return 1
    }
    
    # Remove existing env var (ignore errors)
    vercel env rm "$env_name" $environments --yes 2>/dev/null || true
    
    # Add new env var via stdin (no password in command line)
    printf '%s' "$value" | vercel env add "$env_name" $environments
    
    echo "✅ Set $env_name for $environments"
}

# Helper for literal values
set_env_literal() {
    local env_name="$1"
    local value="$2"
    local environments="$3"
    
    vercel env rm "$env_name" $environments --yes 2>/dev/null || true
    printf '%s' "$value" | vercel env add "$env_name" $environments
    echo "✅ Set $env_name for $environments"
}

echo ""
echo "📦 Production environment..."
set_env_from_keychain "WORKOS_API_KEY" "claw-workos-api-key-prod" "production"
set_env_from_keychain "WORKOS_CLIENT_ID" "claw-workos-client-id-prod" "production"
set_env_from_keychain "WORKOS_COOKIE_PASSWORD" "claw-workos-cookie-password" "production"
set_env_from_keychain "NEXT_PUBLIC_CONVEX_URL" "claw-convex-url-prod" "production"
set_env_literal "WORKOS_REDIRECT_URI" "https://retroshift.vercel.app/auth/callback" "production"

echo ""
echo "🧪 Preview & Development environments..."
set_env_from_keychain "WORKOS_API_KEY" "claw-workos-api-key-staging" "preview development"
set_env_from_keychain "WORKOS_CLIENT_ID" "claw-workos-client-id-staging" "preview development"
set_env_from_keychain "WORKOS_COOKIE_PASSWORD" "claw-workos-cookie-password" "preview development"
set_env_from_keychain "NEXT_PUBLIC_CONVEX_URL" "claw-convex-url-dev" "preview development"
# Note: Preview redirect URI is tricky - each preview has different URL
# For now, staging WorkOS should have the dev URL registered
set_env_literal "WORKOS_REDIRECT_URI" "http://localhost:3000/auth/callback" "development"

echo ""
echo "✅ Done! Run 'vercel --prod' to deploy with new env vars."
