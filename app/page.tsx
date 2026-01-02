'use client';

import { useState, useEffect } from 'react';
import { makeJWT, verifyJWT } from './jwtapi/jwt/decode';

export const runtime = 'edge';

export default function Home() {
  const [encodedJWT, setEncodedJWT] = useState('');
  const [decodedHeader, setDecodedHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [decodedPayload, setDecodedPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe"\n}');
  const [secret, setSecret] = useState('your-secret-key');
  const [error, setError] = useState('');
  const [headerError, setHeaderError] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');

  const validateHeader = (headerStr: string) => {
    try {
      const header = JSON.parse(headerStr);
      if (!header.alg) {
        return 'Header must include "alg" field';
      }
      if (!header.typ) {
        return 'Header must include "typ" field';
      }
      const validAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'];
      if (!validAlgorithms.includes(header.alg)) {
        return `Invalid algorithm. Must be one of: ${validAlgorithms.join(', ')}`;
      }
      return '';
    } catch (error) {
      return 'Invalid JSON format in header';
    }
  };

  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        setDecodedHeader(JSON.stringify(header, null, 2));
        setDecodedPayload(JSON.stringify(payload, null, 2));
        setError('');
        setHeaderError('');
      }
    } catch (error) {
      console.error('Error decoding JWT:', error);
      setError('Invalid JWT format');
      setVerifyMessage('');
    }
  };

  const generateToken = async () => {
    try {
      const headerValidationError = validateHeader(decodedHeader);
      if (headerValidationError) {
        setHeaderError(headerValidationError);
        return;
      }

      const header = JSON.parse(decodedHeader);
      const payload = JSON.parse(decodedPayload);

      const data: any = await makeJWT({ 
        action: 'generate', 
        header, 
        payload, 
        secret 
      });
      
      if (data.error) {
        throw new Error(data.error);
      }

      setEncodedJWT(data.token);
      setError('');
      setHeaderError('');
      setVerifyMessage('');
    } catch (error) {
      console.error('Error generating JWT:', error);
      setError('Error generating token: Invalid JSON or server error');
      setVerifyMessage('');
    }
  };

  const handleTokenChange = (token: string) => {
    setEncodedJWT(token);
    setVerifyMessage('');
    if (token) {
      decodeJWT(token);
    }
  };

  const handleHeaderChange = (value: string) => {
    setDecodedHeader(value);
    setVerifyMessage('');
    const headerValidationError = validateHeader(value);
    setHeaderError(headerValidationError);
  };

  const handlePayloadChange = (value: string) => {
    setDecodedPayload(value);
    setVerifyMessage('');
  };

  const handleSecretChange = (value: string) => {
    setSecret(value);
    setVerifyMessage('');
  };

  const verifyToken = async () => {
    setVerifyMessage('');
    try {
      if (!encodedJWT) {
        setError('No token to verify');
        return;
      }

      const result = await verifyJWT(encodedJWT, secret);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      if (result.header) {
        setDecodedHeader(JSON.stringify(result.header, null, 2));
      }
      if (result.payload) {
        setDecodedPayload(JSON.stringify(result.payload, null, 2));
      }

      setError('');
      setHeaderError('');
      setVerifyMessage('JWT signature verified');
    } catch (error) {
      console.error('Error verifying JWT:', error);
      setError('Failed to verify token');
    }
  };

  // Generate token when header, payload, or secret changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (decodedHeader && decodedPayload && secret) {
        void generateToken();  // void operator to handle the Promise
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [decodedHeader, decodedPayload, secret]);

  const ColoredToken = ({ token }: { token: string }) => {
    if (!token) return null;
    const parts = token.split('.');
    return (
      <div className="font-mono break-all text-slate-200">
        <span className="text-cyan-300">{parts[0]}</span>
        {parts.length > 1 && <span className="text-cyan-200">.</span>}
        <span className="text-pink-300">{parts[1]}</span>
        {parts.length > 2 && (
          <>
            <span className="text-cyan-200">.</span>
            <span className="text-blue-300">{parts[2]}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#0c1424] text-slate-100 pb-16">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-10 space-y-10">
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold">JWT Playground</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#131c2b] border border-[#1f2a3b] rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-50">Encode</h2>
            <textarea
              className="w-full h-[430px] p-4 border border-[#1c2533] rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/70 bg-[#111927] text-cyan-300"
              placeholder="Your encoded JWT will appear here..."
              value={encodedJWT}
              onChange={(e) => handleTokenChange(e.target.value)}
            />
            {(error || verifyMessage) && (
              <div className="mt-4 space-y-3">
                {error && (
                  <div className="bg-red-900/60 border border-red-500/40 text-red-100 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                {verifyMessage && (
                  <div className="bg-emerald-900/60 border border-emerald-500/40 text-emerald-100 px-4 py-3 rounded-lg text-sm">
                    {verifyMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#131c2b] border border-[#1f2a3b] rounded-2xl shadow-xl p-6 space-y-5">
            <h2 className="text-xl font-semibold text-slate-50">Decoded</h2>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 tracking-wide">HEADER</p>
              <textarea
                className={`w-full h-40 p-4 border rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/70 bg-[#111927] text-pink-200 ${
                  headerError ? 'border-red-500/70' : 'border-[#1c2533]'
                }`}
                value={decodedHeader}
                onChange={(e) => handleHeaderChange(e.target.value)}
                placeholder="Enter header JSON..."
              />
              {headerError && (
                <div className="text-red-300 text-xs">{headerError}</div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 tracking-wide">PAYLOAD</p>
              <textarea
                className="w-full h-56 p-4 border border-[#1c2533] rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500/70 bg-[#111927] text-pink-300"
                value={decodedPayload}
                onChange={(e) => handlePayloadChange(e.target.value)}
                placeholder="Enter payload JSON..."
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 tracking-wide">VERIFY SIGNATURE</p>
              <div className="bg-[#111927] border border-[#1c2533] rounded-xl text-sm font-mono text-slate-200 p-4 space-y-1">
                <div>
                  <span className="text-cyan-300">HMACSHA256</span>(
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">base64UrlEncode</span>(<span className="text-red-300">header</span>) + "." +
                </div>
                <div className="pl-8">
                  <span className="text-cyan-300">base64UrlEncode</span>(<span className="text-pink-300">payload</span>),
                </div>
                <div className="pt-2">
                  <input
                    type="text"
                    className="w-full p-3 border border-[#1c2533] rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/70 bg-[#0d1724] text-blue-200"
                    value={secret}
                    onChange={(e) => handleSecretChange(e.target.value)}
                    placeholder="your-secret-key"
                  />
                </div>
                <div className="text-blue-200 pt-2">) secret base64 encoded</div>
                <button
                  type="button"
                  className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors duration-150"
                  onClick={() => void verifyToken()}
                >
                  Verify JWT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
