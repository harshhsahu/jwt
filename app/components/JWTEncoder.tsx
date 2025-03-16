'use client';

import { useState, useEffect } from 'react';
import jwt from 'jsonwebtoken';

interface JWTEncoderProps {
  onTokenGenerated: (token: string) => void;
  initialToken: string;
}

export default function JWTEncoder({ onTokenGenerated, initialToken }: JWTEncoderProps) {
  const [header, setHeader] = useState({
    alg: 'HS256',
    typ: 'JWT'
  });
  
  const [payload, setPayload] = useState({
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000)
  });
  
  const [secret, setSecret] = useState('your-secret-key');

  const generateToken = () => {
    try {
      const token = jwt.sign(payload, secret, { 
        algorithm: header.alg as jwt.Algorithm,
        header: header
      });
      onTokenGenerated(token);
    } catch (error) {
      console.error('Error generating JWT:', error);
    }
  };

  // Auto-generate token when payload, header, or secret changes
  useEffect(() => {
    generateToken();
  }, [payload, header, secret]);

  const updatePayload = (value: string) => {
    try {
      const newPayload = JSON.parse(value);
      setPayload(newPayload);
    } catch (error) {
      // Invalid JSON, but we don't need to show an error
    }
  };

  // Try to decode initial token if provided
  useEffect(() => {
    if (initialToken) {
      try {
        const parts = initialToken.split('.');
        if (parts.length === 3) {
          const decodedHeader = JSON.parse(atob(parts[0]));
          const decodedPayload = JSON.parse(atob(parts[1]));
          setHeader(decodedHeader);
          setPayload(decodedPayload);
        }
      } catch (error) {
        console.error('Error decoding initial token:', error);
      }
    }
  }, [initialToken]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-indigo-500 mb-2">HEADER</h3>
        <textarea
          className="w-full h-32 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
          value={JSON.stringify(header, null, 2)}
          onChange={(e) => {
            try {
              setHeader(JSON.parse(e.target.value));
            } catch (error) {
              // Invalid JSON
            }
          }}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-indigo-500 mb-2">PAYLOAD</h3>
        <textarea
          className="w-full h-48 p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => updatePayload(e.target.value)}
        />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-indigo-500 mb-2">SECRET</h3>
        <input
          type="text"
          className="w-full p-2 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
      </div>
    </div>
  );
} 