import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      type: "customJwt",
      // Custom issuer for self-signed JWTs minted by our token endpoint.
      // The token endpoint verifies the WorkOS session cookie and mints
      // a short-lived JWT with the WorkOS user ID as subject.
      issuer: "https://retroshift.vercel.app",
      applicationID: "convex",
      // JWKS embedded as data URI (RS256 public key)
      jwks: "data:application/json;base64,eyJrZXlzIjpbeyJrdHkiOiJSU0EiLCJuIjoib3RQUDFEQXl1TlhwU3hsaXd1eXk1OWVwT2Etem9kNVB6bmFnTjFxXzZvZTYzbkxkQ1ViVm1Fb1MtOWM5Zm10QmY5SzFpRXJIXzRqVUFrR2RWQVpuOU5obnFBNEZ2TklWSUQ5UWRnVXlFNDdqeGl6MjAzQTFQUE5aTXFLbzRaOWxLZi05dE9XOWk1Z25UNGhxTnh2RWp0NDlNalZWeExLeTR2SHh2ZW9ialJyNk1OZUllTGZGOEhXVWh1NTNBNzN4YVlMTkE5ZjM4dmFpME5fUWxqSm1IcVlQMXMzdXhzUERrVnBaOVRxWDNfRUVJeXRhSXU5bWRmRVhUWU12WUhmbldISFJGaWMxNnpMV241N0JIT3NhUjdvc0pVQnJYbm43ZnB0TWRkVmFsZnBjOF85Z2pNYWU5SDlEc1JZanhvMFM4Z3FPdU05dzMtTXNKYkhrTVpvOF9RIiwiZSI6IkFRQUIiLCJraWQiOiJyZXRyb3NoaWZ0LWNvbnZleC0xIiwiYWxnIjoiUlMyNTYiLCJ1c2UiOiJzaWcifV19",
      algorithm: "RS256" as const,
    },
  ],
} satisfies AuthConfig;
