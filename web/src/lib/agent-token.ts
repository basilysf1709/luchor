import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.AGENT_AUTH_SECRET;
  if (!secret) {
    throw new Error("AGENT_AUTH_SECRET is not set.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create a short-lived JWT for authenticating a user to the agent service.
 * Token expires in 5 minutes — only valid for the duration of a single request.
 */
export async function createAgentToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .setIssuer("luchor-web")
    .sign(getSecret());
}

/**
 * Verify an agent token and return the userId.
 * Can be used by the agent service if it shares the same secret.
 */
export async function verifyAgentToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), {
    issuer: "luchor-web",
  });
  return payload.sub!;
}
