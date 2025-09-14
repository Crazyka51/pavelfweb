"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { testDatabaseConnection, getAdminUsers, setPavelPassword, testLogin } from "@/app/actions/auth-actions";

export default function TestPage() {
  const [results, setResults] = useState<any[]>([]);
  const [username, setUsername] = useState("pavel");
  const [password, setPassword] = useState("admin123");

  const addResult = (result: any) => {
    setResults((prev) => [...prev, { ...result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const handleTestConnection = async () => {
    const result = await testDatabaseConnection();
    addResult({ action: "Test připojení", ...result });
  };

  const handleGetUsers = async () => {
    const result = await getAdminUsers();
    addResult({ action: "Načíst uživatele", ...result });
  };

  const handleSetPassword = async () => {
    const result = await setPavelPassword();
    addResult({ action: "Nastavit heslo", ...result });
  };

  const handleTestLogin = async () => {
    const result = await testLogin(username, password);
    addResult({ action: "Test přihlášení", ...result });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Test Autentizace</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Databázové testy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleTestConnection} className="w-full">
              Test připojení k databázi
            </Button>
            <Button onClick={handleGetUsers} className="w-full">
              Načíst admin uživatele
            </Button>
            <Button onClick={handleSetPassword} className="w-full">
              Nastavit heslo pro pavel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test přihlášení</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button onClick={handleTestLogin} className="w-full">
              Test přihlášení
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Výsledky testů</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <div className="font-medium">
                  {result.action} - {result.timestamp}
                </div>
                <div className="text-sm text-gray-600">{result.message}</div>
                {result.error && <div className="text-xs text-red-600 mt-1">{result.error}</div>}
                {result.users && <div className="text-xs mt-1">Nalezeno {result.users.length} uživatelů</div>}
                {result.user && (
                  <div className="text-xs mt-1">
                    Uživatel: {result.user.username} ({result.user.email})
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
