import { getSession } from "@/lib/auth";
import { SignJWT, importJWK } from "jose";
import { NextResponse } from "next/server";

// The private key (JWK) for signing Convex auth tokens.
// Stored as env var to keep it out of source code.
let cachedPrivateKey: CryptoKey | null = null;

async function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey;
  const jwk = JSON.parse(process.env.CONVEX_AUTH_PRIVATE_KEY!);
  cachedPrivateKey = (await importJWK(jwk, "RS256")) as CryptoKey;
  return cachedPrivateKey;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ token: null }, { status: 401 });
    }

    const privateKey = await getPrivateKey();

    // Mint a short-lived JWT for Convex with the WorkOS user ID as subject.
    // Claims match what convex/auth.config.ts expects.
    const token = await new SignJWT({
      // Include user info so Convex identity has useful fields
      email: session.user.email,
      name: [session.user.firstName, session.user.lastName]
        .filter(Boolean)
        .join(" ") || undefined,
      picture: session.user.profilePictureUrl || undefined,
    })
      .setProtectedHeader({ alg: "RS256", kid: "retroshift-convex-1", typ: "JWT" })
      .setSubject(session.user.id) // WorkOS user ID (e.g. user_01ABC...)
      .setIssuer("https://retroshift.vercel.app")
      .setAudience("convex")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Token endpoint error:", error);
    return NextResponse.json({ token: null }, { status: 500 });
  }
}
