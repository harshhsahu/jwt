import * as jose from 'jose';

export const runtime = 'edge';

interface JWTRequest {
  action: 'generate';
  header: {
    alg: string;
    typ: string;
  };
  payload: any;
  secret: string;
}

export async function makeJWT({ header, payload, secret }: JWTRequest) {
  try {
    // Convert secret to Uint8Array
    const secretBytes = new TextEncoder().encode(secret);

    // Create signing key
    const signingKey = await new jose.CompactSign(
      new TextEncoder().encode(JSON.stringify(payload))
    )
      .setProtectedHeader({ ...header })
      .sign(secretBytes);

    return {
      token: signingKey
    };
  } catch (error) {
    console.error('JWT Generation Error:', error);
    return { error: 'Failed to generate JWT' };
  }
}

export async function verifyJWT(token: string, secret: string) {
  try {
    const secretBytes = new TextEncoder().encode(secret);
    const { payload, protectedHeader } = await jose.jwtVerify(token, secretBytes);

    return {
      valid: true,
      payload,
      header: protectedHeader
    };
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return { error: 'Invalid token or signature' };
  }
}
