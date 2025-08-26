import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth-utils-v2';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * API endpoint pro získání seznamu nahraných médií
 * 
 * GET /api/admin/media/list
 */
export async function GET(request: NextRequest) {
  try {
    // Autentizace admina
    const admin = await authenticateAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const mediaDir = path.join(process.cwd(), 'public', 'media');
    
    // Pokud adresář médií neexistuje, vrátíme prázdný seznam
    if (!existsSync(mediaDir)) {
      return NextResponse.json({ success: true, media: [] });
    }

    // Získání parametrů dotazu
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    // Určení cesty pro výpis souborů
    let targetDir = mediaDir;
    if (year) {
      targetDir = path.join(targetDir, year);
      
      // Kontrola existence adresáře roku
      if (!existsSync(targetDir)) {
        return NextResponse.json({ success: true, media: [] });
      }
      
      if (month) {
        targetDir = path.join(targetDir, month);
        
        // Kontrola existence adresáře měsíce
        if (!existsSync(targetDir)) {
          return NextResponse.json({ success: true, media: [] });
        }
      }
    }

    // Pokud není zadán rok ani měsíc, nejprve načteme dostupné roky
    if (!year) {
      const years = await readdir(mediaDir);
      const yearDirs = await Promise.all(
        years.map(async (y) => {
          const yearPath = path.join(mediaDir, y);
          const dirStat = await stat(yearPath);
          return { name: y, isDirectory: dirStat.isDirectory() };
        })
      );
      
      // Filtrujeme pouze adresáře a řadíme sestupně
      const filteredYears = yearDirs
        .filter(y => y.isDirectory)
        .map(y => y.name)
        .sort((a, b) => parseInt(b) - parseInt(a));
      
      return NextResponse.json({ 
        success: true, 
        years: filteredYears 
      });
    }
    
    // Pokud je zadán rok, ale ne měsíc, načteme dostupné měsíce
    if (year && !month) {
      const months = await readdir(targetDir);
      const monthDirs = await Promise.all(
        months.map(async (m) => {
          const monthPath = path.join(targetDir, m);
          const dirStat = await stat(monthPath);
          return { name: m, isDirectory: dirStat.isDirectory() };
        })
      );
      
      // Filtrujeme pouze adresáře a řadíme sestupně
      const filteredMonths = monthDirs
        .filter(m => m.isDirectory)
        .map(m => m.name)
        .sort((a, b) => parseInt(b) - parseInt(a));
      
      return NextResponse.json({ 
        success: true, 
        year,
        months: filteredMonths 
      });
    }
    
    // Pokud jsou zadány oba parametry, načteme seznam souborů
    const files = await readdir(targetDir);
    const mediaFiles = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(targetDir, file);
        const fileStat = await stat(filePath);
        
        // Pokud je to soubor, přidáme jeho metadata
        if (fileStat.isFile()) {
          // Extrahujeme hash a původní název
          const fileNameParts = file.split('-');
          const hash = fileNameParts[0];
          const originalName = fileNameParts.slice(1).join('-');
          
          // URL pro zobrazení média
          const url = `/media/${year}/${month}/${file}`;
          
          return {
            name: file,
            originalName,
            url,
            size: fileStat.size,
            createdAt: fileStat.birthtime,
            updatedAt: fileStat.mtime
          };
        }
        
        return null;
      })
    );
    
    // Filtrujeme pouze soubory (ne adresáře) a řadíme podle data vytvoření
    const filteredFiles = mediaFiles
      .filter(f => f !== null)
      .sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime());
    
    return NextResponse.json({ 
      success: true, 
      year,
      month,
      media: filteredFiles 
    });
    
  } catch (error) {
    console.error('Error listing media:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
