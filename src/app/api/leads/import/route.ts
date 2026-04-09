import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CSVRow {
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  budget_min?: string;
  budget_max?: string;
  preferred_location?: string;
  notes?: string;
}

const VALID_SOURCES = [
  "website", "whatsapp", "phone", "walkin",
  "referral", "99acres", "magicbricks", "housing", "other",
];

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): CSVRow[] {
  const lines = text.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (values[idx]) row[h] = values[idx];
    });
    if (row.name) rows.push(row as unknown as CSVRow);
  }

  return rows;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 400 });
    }

    const body = await request.json();
    const csvText = body.csv as string;

    if (!csvText) {
      return NextResponse.json({ error: "CSV data is required" }, { status: 400 });
    }

    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return NextResponse.json({ error: "No valid rows found in CSV" }, { status: 400 });
    }

    const leads = rows.map((row) => ({
      organization_id: profile.organization_id,
      name: row.name,
      email: row.email || null,
      phone: row.phone || null,
      source: VALID_SOURCES.includes(row.source || "") ? row.source : "other",
      budget_min: row.budget_min ? Number(row.budget_min) : null,
      budget_max: row.budget_max ? Number(row.budget_max) : null,
      preferred_location: row.preferred_location || null,
      notes: row.notes || null,
      status: "new",
    }));

    const { data, error } = await supabase
      .from("leads")
      .insert(leads)
      .select();

    if (error) throw error;

    return NextResponse.json({
      imported: data?.length || 0,
      total: rows.length,
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Failed to import leads" },
      { status: 500 }
    );
  }
}
