'use client';

import { useState, useEffect } from 'react';
import { makeJWT } from './jwtapi/jwt/decode';

export const runtime = 'experimental-edge';

export default function Home() {
  const [encodedJWT, setEncodedJWT] = useState('');
  const [decodedHeader, setDecodedHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}');
  const [decodedPayload, setDecodedPayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe"\n}');
  const [secret, setSecret] = useState('your-secret-key');
  const [error, setError] = useState('');
  const [headerError, setHeaderError] = useState('');

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
    } catch (error) {
      console.error('Error generating JWT:', error);
      setError('Error generating token: Invalid JSON or server error');
    }
  };

  const handleTokenChange = (token: string) => {
    setEncodedJWT(token);
    if (token) {
      decodeJWT(token);
    }
  };

  const handleHeaderChange = (value: string) => {
    setDecodedHeader(value);
    const headerValidationError = validateHeader(value);
    setHeaderError(headerValidationError);
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
      <div className="font-mono break-all">
        <span className="text-red-400">{parts[0]}</span>
        {parts.length > 1 && <span className="text-pink-400">.</span>}
        <span className="text-pink-400">{parts[1]}</span>
        {parts.length > 2 && <span className="text-blue-400">.</span>}
        <span className="text-blue-400">{parts[2]}</span>
      </div>
    );
  };

  return (
    <main className="min-h-screen p-8 bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-white mb-8">JWT Playground</h1>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Token Input Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Token</h2>
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  className="w-full h-96 p-4 border border-gray-700 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-gray-800 opacity-0 absolute inset-0 z-10"
                  placeholder="Paste your JWT token here..."
                  value={encodedJWT}
                  onChange={(e) => handleTokenChange(e.target.value)}
                />
                <div className="w-full h-96 p-4 border border-gray-700 rounded-lg text-sm bg-gray-800 overflow-auto">
                  {encodedJWT ? (
                    <ColoredToken token={encodedJWT} />
                  ) : (
                    <span className="text-gray-500">Paste your JWT token here...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Decoded Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Decoded</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-white mb-2">HEADER</h3>
                <textarea
                  className={`w-full h-40 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-800 text-red-400 ${
                    headerError ? 'border-red-500' : 'border-gray-700'
                  }`}
                  value={decodedHeader}
                  onChange={(e) => handleHeaderChange(e.target.value)}
                  placeholder="Enter header JSON..."
                />
                {headerError && (
                  <div className="mt-2 text-red-400 text-sm">
                    {headerError}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-2">PAYLOAD</h3>
                <textarea
                  className="w-full h-64 p-4 border border-gray-700 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-800 text-pink-400"
                  value={decodedPayload}
                  onChange={(e) => setDecodedPayload(e.target.value)}
                  placeholder="Enter payload JSON..."
                />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-2">VERIFY SIGNATURE</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800 p-4 rounded-lg text-sm font-mono border border-gray-700">
                    <span className="text-cyan-400">HMACSHA256</span>(
                    <br />
                    <span className="text-cyan-400 ml-8">base64UrlEncode</span>(<span className="text-red-400">header</span>) + "." +
                    <br />
                    <span className="text-cyan-400 ml-8">base64UrlEncode</span>(<span className="text-pink-400">payload</span>),
                    <br />
                    <div className="mt-2 mb-2">
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-700 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-blue-400"
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        placeholder="Enter your secret key..."
                      />
                    </div>
                    ) <span className="text-blue-400">secret base64 encoded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
