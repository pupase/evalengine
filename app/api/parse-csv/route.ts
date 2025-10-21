import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { InputRow } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();

    // Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Error parsing CSV',
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // Convert parsed data to InputRow format
    // Assume the first column contains the main data
    // or look for a column named 'text', 'data', 'content', etc.
    const rows = parseResult.data as Record<string, string>[];
    const inputs: InputRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const keys = Object.keys(row);

      if (keys.length === 0) continue;

      // Try to find a data column
      let dataColumn = keys.find((k) =>
        ['text', 'data', 'content', 'input'].includes(k.toLowerCase())
      );

      // If not found, use the first column
      if (!dataColumn) {
        dataColumn = keys[0];
      }

      const data = row[dataColumn];
      if (!data || typeof data !== 'string') continue;

      inputs.push({
        id: `row-${i}`,
        data: data.trim(),
        metadata: row,
      });
    }

    if (inputs.length === 0) {
      return NextResponse.json(
        { error: 'No valid data rows found in CSV' },
        { status: 400 }
      );
    }

    return NextResponse.json({ inputs });
  } catch (error: unknown) {
    console.error('Error parsing CSV:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
