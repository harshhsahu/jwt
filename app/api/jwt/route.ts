import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { action, header, payload, secret } = await request.json();

    if (action === 'generate') {
      const token = jwt.sign(payload, secret, {
        algorithm: header.alg as jwt.Algorithm,
        header: header
      });
      return NextResponse.json({ token });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('JWT API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 