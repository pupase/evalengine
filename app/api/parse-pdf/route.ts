import { NextRequest, NextResponse } from 'next/server';
import { InputRow } from '@/types';
import * as pdfParseModule from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate PDF files
    for (const file of files) {
      if (!file.type || !file.type.includes('pdf')) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only PDF files are supported.` },
          { status: 400 }
        );
      }
    }

    const inputs: InputRow[] = [];

    // Get the pdf parse function (handle both CJS and ESM)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;

    // Process each PDF file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF
        const data = await pdfParse(buffer);
        const text = data.text.trim();

        if (!text) {
          return NextResponse.json(
            { error: `No text content found in ${file.name}` },
            { status: 400 }
          );
        }

        // Add to inputs
        inputs.push({
          id: `resume-${i}`,
          data: text,
          filename: file.name,
          metadata: {
            filename: file.name,
            pages: data.numpages.toString(),
            size: file.size.toString(),
          },
        });
      } catch (error: unknown) {
        console.error(`Error parsing ${file.name}:`, error);
        return NextResponse.json(
          {
            error: `Failed to parse PDF: ${file.name}`,
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 400 }
        );
      }
    }

    if (inputs.length === 0) {
      return NextResponse.json(
        { error: 'No valid PDF files were processed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ inputs });
  } catch (error: unknown) {
    console.error('Error in parse-pdf API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
