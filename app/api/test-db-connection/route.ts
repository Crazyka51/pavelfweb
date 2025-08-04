import { NextResponse } from "next/server";
import { sql, checkDatabaseConnection } from "@/lib/database";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Použijeme centrální připojení k databázi z lib/database.ts
    const connected = await checkDatabaseConnection();
    
    if (!connected) {
      throw new Error("Nepodařilo se připojit k databázi");
    }
    
    const rows = await sql`SELECT NOW()`;
    console.log(rows);
    return NextResponse.json({ success: true, time: rows });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
