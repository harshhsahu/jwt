import * as jose from 'jose';

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
    const alg = header.alg as jose.KeyLike;
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