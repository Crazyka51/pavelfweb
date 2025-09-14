'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadIcon, Trash2, Search } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

type MediaFile = {
  name: string
  originalName: string
  url: string
  size: number
  createdAt: string
  updatedAt: string
}

export default function MediaManager({ onSelectMedia }: { onSelectMedia?: (url: string) => void }) {
  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('browse');
  
  const { toast } = useToast();

  // Načtení let při inicializaci
  useEffect(() => {
    fetchYears();
  }, []);

  // Načtení měsíců při změně roku
  useEffect(() => {
    if (selectedYear) {
      fetchMonths(selectedYear);
    } else {
      setMonths([]);
      setSelectedMonth(null);
      setMediaFiles([]);
    }
  }, [selectedYear]);

  // Načtení souborů při změně měsíce
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      fetchMediaFiles(selectedYear, selectedMonth);
    } else {
      setMediaFiles([]);
    }
  }, [selectedYear, selectedMonth]);

  const fetchYears = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/media/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success && data.years) {
        setYears(data.years);
        // Automaticky vybereme první rok
        if (data.years.length > 0) {
          setSelectedYear(data.years[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching years:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst roky médií',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonths = async (year: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/media/list?year=${year}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success && data.months) {
        setMonths(data.months);
        // Automaticky vybereme první měsíc
        if (data.months.length > 0) {
          setSelectedMonth(data.months[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching months:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst měsíce médií',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMediaFiles = async (year: string, month: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/media/list?year=${year}&month=${month}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success && data.media) {
        setMediaFiles(data.media);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se načíst média',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Kontrola typu souboru
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Nepodporovaný formát',
            description: `Soubor "${file.name}" není obrázek`,
            variant: 'destructive',
          });
          continue;
        }
        
        // Kontrola velikosti souboru
        if (file.size > 5 * 1024 * 1024) { // 5MB
          toast({
            title: 'Soubor je příliš velký',
            description: `Soubor "${file.name}" je větší než 5MB`,
            variant: 'destructive',
          });
          continue;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: 'Soubor nahrán',
            description: `Soubor "${file.name}" byl úspěšně nahrán`,
          });
          
          // Aktualizace seznamu souborů
          const currentDate = new Date();
          const year = currentDate.getFullYear().toString();
          const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
          
          if (selectedYear !== year || selectedMonth !== month) {
            setSelectedYear(year);
            setSelectedMonth(month);
          } else {
            fetchMediaFiles(year, month);
          }
        } else {
          toast({
            title: 'Chyba',
            description: data.error || `Nepodařilo se nahrát soubor "${file.name}"`,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se nahrát soubory',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset input field
      event.target.value = '';
    }
  };

  const deleteMedia = async (file: MediaFile) => {
    if (!confirm(`Opravdu chcete smazat soubor "${file.originalName}"?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/media/delete?path=${encodeURIComponent(file.url)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Soubor smazán',
          description: `Soubor "${file.originalName}" byl úspěšně smazán`,
        });
        
        // Aktualizace seznamu souborů
        setMediaFiles(mediaFiles.filter(m => m.url !== file.url));
      } else {
        toast({
          title: 'Chyba',
          description: data.error || `Nepodařilo se smazat soubor "${file.originalName}"`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se smazat soubor',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredMediaFiles = searchTerm 
    ? mediaFiles.filter(file => 
        file.originalName.toLowerCase().includes(searchTerm.toLowerCase()))
    : mediaFiles;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="browse">Procházet média</TabsTrigger>
          <TabsTrigger value="upload">Nahrát média</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear || undefined}
                onValueChange={(value) => setSelectedYear(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rok" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={selectedMonth || undefined}
                onValueChange={(value) => setSelectedMonth(value)}
                disabled={!selectedYear || months.length === 0}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Měsíc" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hledat média..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredMediaFiles.length === 0 ? (
            <div className="text-center p-8 bg-muted rounded-md">
              {searchTerm ? (
                <p>Žádná média neodpovídají vyhledávání.</p>
              ) : (
                <p>Pro tento měsíc nejsou k dispozici žádná média.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMediaFiles.map((file) => (
                <Card key={file.url} className="overflow-hidden group relative">
                  <div className="aspect-square relative">
                    <Image
                      src={file.url}
                      alt={file.originalName}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs truncate">{file.originalName}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {onSelectMedia && (
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={() => onSelectMedia(file.url)}
                        >
                          Vybrat
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteMedia(file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="p-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                <UploadIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nahrajte média</h3>
                <p className="text-muted-foreground mb-4">
                  Přetáhněte soubory sem nebo klikněte pro výběr souborů.
                  <br />
                  Podporované formáty: JPG, PNG, GIF, WebP, SVG
                  <br />
                  Maximální velikost souboru: 5MB
                </p>
                
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                
                <Button 
                  asChild
                  disabled={uploading}
                >
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Nahrávání...
                      </>
                    ) : (
                      <>
                        <UploadIcon className="h-4 w-4 mr-2" />
                        Vybrat soubory
                      </>
                    )}
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
