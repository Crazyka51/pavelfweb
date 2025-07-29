import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    const rows = await sql`SELECT NOW()`;
    console.log(rows);
    return NextResponse.json({ success: true, time: rows });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
