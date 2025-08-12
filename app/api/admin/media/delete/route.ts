import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth-utils-fixed';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * API endpoint pro smazání média
 * 
 * DELETE /api/admin/media/delete?path=/media/2023/01/file.jpg
 */
export async function DELETE(request: NextRequest) {
  try {
    // Autentizace admina
    const admin = await authenticateAdmin(request);
    
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Získání parametrů dotazu
    const { searchParams } = new URL(request.url);
    const mediaPath = searchParams.get('path');
    
    if (!mediaPath) {
      return NextResponse.json({ success: false, error: 'No file path provided' }, { status: 400 });
    }
    
    // Odstranění počátečního lomítka (pokud existuje)
    const cleanPath = mediaPath.startsWith('/') ? mediaPath.substring(1) : mediaPath;
    
    // Kontrola, zda cesta obsahuje pouze povolené složky (média)
    if (!cleanPath.startsWith('media/')) {
      return NextResponse.json({ success: false, error: 'Invalid file path' }, { status: 400 });
    }
    
    // Převod na absolutní cestu
    const filePath = path.join(process.cwd(), 'public', cleanPath);
    
    // Kontrola existence souboru
    if (!existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }
    
    // Smazání souboru
    await unlink(filePath);
    
    return NextResponse.json({ 
      success: true, 
      message: 'File deleted successfully',
      path: mediaPath
    });
    
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
