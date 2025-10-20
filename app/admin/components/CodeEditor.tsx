"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, FileCode, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { authorizedFetch } from "@/lib/auth-fetch";

interface ComponentFile {
  name: string;
  path: string;
  size: number;
  modified: string;
}

export default function CodeEditor() {
  const [files, setFiles] = useState<ComponentFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ComponentFile | null>(null);
  const [content, setContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authorizedFetch("/api/admin/code-editor");
      const data = await response.json();

      if (data.success) {
        setFiles(data.files);
      } else {
        setError(data.error || "Failed to load files");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (file: ComponentFile) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await authorizedFetch("/api/admin/code-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: file.path,
          action: "read",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setContent(data.content);
        setOriginalContent(data.content);
        setSelectedFile(file);
      } else {
        setError(data.error || "Failed to load file content");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file content");
    } finally {
      setLoading(false);
    }
  };

  const saveFileContent = async () => {
    if (!selectedFile) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await authorizedFetch("/api/admin/code-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: selectedFile.path,
          action: "write",
          content: content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Soubor byl úspěšně uložen!");
        setOriginalContent(content);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || "Failed to save file");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save file");
    } finally {
      setSaving(false);
    }
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasChanges = content !== originalContent;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Editor komponent</h1>
        <p className="text-gray-600">
          Editujte textový obsah a kód komponent webu
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Komponenty
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat soubor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading && files.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => loadFileContent(file)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                      selectedFile?.path === file.path
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedFile ? selectedFile.name : "Vyberte soubor"}
              </CardTitle>
              {selectedFile && (
                <div className="flex gap-2">
                  {hasChanges && (
                    <span className="text-sm text-orange-600 flex items-center">
                      Neuložené změny
                    </span>
                  )}
                  <Button
                    onClick={saveFileContent}
                    disabled={saving || !hasChanges}
                    size="sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Ukládání...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Uložit
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {loading && selectedFile ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : selectedFile ? (
              <div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-[600px] p-4 font-mono text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  spellCheck={false}
                />
                <div className="mt-2 text-sm text-gray-500">
                  Řádky: {content.split("\n").length} | Znaky: {content.length}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Vyberte soubor pro editaci</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Warning notice */}
      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-yellow-600">⚠️</div>
            <div className="text-sm">
              <strong>Upozornění:</strong> Editujete přímo zdrojové soubory
              komponent. Buďte opatrní při úpravách kódu, protože chyby mohou
              způsobit nefunkčnost webu. Doporučujeme upravovat pouze textový
              obsah (texty, nadpisy, popisy) a neměnit strukturu kódu.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
