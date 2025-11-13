import { NextRequest, NextResponse } from 'next/server';
import { InputRow } from '@/types';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

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

    // Process each PDF file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        const pdfDoc = await loadingTask.promise;

        const numPages = pdfDoc.numPages;
        let fullText = '';

        // Extract text from all pages
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
          fullText += pageText + '\n';
        }

        const text = fullText.trim();

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
            pages: numPages.toString(),
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
