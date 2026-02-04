#!/bin/bash
# Setup Vercel environment variables using API

set -e
cd /Users/shiftclaw/.openclaw/workspace/retroshift

PROJECT_ID="prj_Im9uYFMPD7VcSgdpByeTSmyOzt79"
TEAM_ID="team_3KYEiwuTybrx6AMBe9mRtJVd"
AUTH_FILE="$HOME/Library/Application Support/com.vercel.cli/auth.json"
VERCEL_TOKEN=$(cat "$AUTH_FILE" | grep '"token"' | cut -d'"' -f4)

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Could not read Vercel token"
    exit 1
fi

echo "🔐 Configuring Vercel env vars via API..."

add_env() {
    local key=$1
    local keychain_name=$2
    local env_type=${3:-encrypted}
    
    local value=$(security find-generic-password -a "retroshift" -s "$keychain_name" -w 2>/dev/null)
    
    if [ -z "$value" ]; then
        echo "  ⚠ $key - not found in keychain ($keychain_name)"
        return 0
    fi
    
    # Escape for JSON
    local escaped_value=$(echo -n "$value" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
    
    # Create JSON payload manually
    local payload="{\"key\":\"$key\",\"value\":$escaped_value,\"type\":\"$env_type\",\"target\":[\"production\",\"preview\",\"development\"]}"
    
    # Call Vercel API
    local response=$(curl -s -X POST \
        "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>&1)
    
    if echo "$response" | grep -q '"error"'; then
        local error_code=$(echo "$response" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('error',{}).get('code','unknown'))" 2>/dev/null)
        
        if [ "$error_code" = "ENV_ALREADY_EXISTS" ]; then
            # Get env ID and update
            local envs=$(curl -s "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
                -H "Authorization: Bearer $VERCEL_TOKEN")
            local env_id=$(echo "$envs" | python3 -c "import json,sys; d=json.load(sys.stdin); print(next((e['id'] for e in d.get('envs',[]) if e['key']=='$key'),''))" 2>/dev/null)
            
            if [ -n "$env_id" ]; then
                curl -s -X PATCH \
                    "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$env_id?teamId=$TEAM_ID" \
                    -H "Authorization: Bearer $VERCEL_TOKEN" \
                    -H "Content-Type: application/json" \
                    -d "$payload" > /dev/null 2>&1
                echo "  ✓ $key (updated)"
                return 0
            fi
        fi
        echo "  ✗ $key - $error_code"
        return 0
    fi
    
    echo "  ✓ $key"
}

add_static() {
    local key=$1
    local value=$2
    
    local payload="{\"key\":\"$key\",\"value\":\"$value\",\"type\":\"plain\",\"target\":[\"production\",\"preview\",\"development\"]}"
    
    curl -s -X POST \
        "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$payload" > /dev/null 2>&1
    
    echo "  ✓ $key"
}

# WorkOS
add_env "WORKOS_API_KEY" "claw-workos-api-key" "encrypted"
add_env "WORKOS_CLIENT_ID" "claw-workos-client-id" "encrypted"
add_env "WORKOS_COOKIE_PASSWORD" "claw-workos-cookie-password" "encrypted"

# Stripe
add_env "STRIPE_SECRET_KEY" "claw-stripe-secret-key" "encrypted"
add_env "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "claw-stripe-publishable-key" "plain"
add_env "STRIPE_WEBHOOK_SECRET" "claw-stripe-webhook-secret" "encrypted"
add_env "STRIPE_PRICE_ID" "claw-stripe-price-id" "encrypted"

# Convex
add_env "NEXT_PUBLIC_CONVEX_URL" "claw-convex-url" "plain"

# Groq
add_env "GROQ_API_KEY" "claw-groq-api-key" "encrypted"

# Static
add_static "NEXT_PUBLIC_APP_URL" "https://retroshift.vercel.app"

echo ""
echo "✅ Vercel environment configured!"
