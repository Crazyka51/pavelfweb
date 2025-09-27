'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';

export default function AuthDebugInfo() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    // Získání tokenu z localStorage
    const storedToken = localStorage.getItem('adminToken');
    setToken(storedToken);

    // Test API verify
    const testVerify = async () => {
      if (storedToken) {
        try {
          const response = await fetch('/api/admin/auth/v2/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          const data = await response.json();
          setDebugInfo({ status: response.status, data });
        } catch (error: any) {
          setDebugInfo({ error: error.message });
        }
      }
    };

    testVerify();
  }, [isAuthenticated]);

  if (process.env.NODE_ENV !== 'development') {
    return null; // Zobrazit pouze v development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔧 Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? '⏳' : '✅'}</div>
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User: {user ? `${user.username} (${user.role})` : 'None'}</div>
        <div>Token: {token ? `${token.slice(0, 20)}...` : 'None'}</div>
        <div>Verify API: {debugInfo ? JSON.stringify(debugInfo).slice(0, 50) + '...' : 'Testing...'}</div>
      </div>
    </div>
  );
}