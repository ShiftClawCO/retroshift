#!/bin/bash
# Generate .env.local from Keychain values

cd "$(dirname "$0")/.."

WORKOS_API_KEY=$(security find-generic-password -s "claw-retroshift-workos-api-key-staging" -w 2>/dev/null)
WORKOS_CLIENT_ID=$(security find-generic-password -s "claw-retroshift-workos-client-id-staging" -w 2>/dev/null)
WORKOS_COOKIE_PASSWORD=$(security find-generic-password -s "claw-retroshift-workos-cookie-password" -w 2>/dev/null)
GROQ_API_KEY=$(security find-generic-password -s "claw-groq-api-key" -w 2>/dev/null)

cat > .env.local << EOF
# Convex (dev)
CONVEX_DEPLOYMENT=dev:dusty-flamingo-760
NEXT_PUBLIC_CONVEX_URL=https://dusty-flamingo-760.convex.cloud

# WorkOS (staging)
WORKOS_API_KEY=${WORKOS_API_KEY}
WORKOS_CLIENT_ID=${WORKOS_CLIENT_ID}
WORKOS_COOKIE_PASSWORD=${WORKOS_COOKIE_PASSWORD}
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback

# Groq
GROQ_API_KEY=${GROQ_API_KEY}
EOF

echo "✅ Generated .env.local"
