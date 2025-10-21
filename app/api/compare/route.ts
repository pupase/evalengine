import { NextRequest, NextResponse } from 'next/server';
import { executePrompt } from '@/lib/llm-providers';
import { PromptConfig, InputRow, ComparisonResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, inputs } = body as {
      config: PromptConfig;
      inputs: InputRow[];
    };

    // Validate required fields
    if (!config.promptA || !config.promptB || !config.model) {
      return NextResponse.json(
        { error: 'Missing required fields: promptA, promptB, or model' },
        { status: 400 }
      );
    }

    if (!inputs || inputs.length === 0) {
      return NextResponse.json(
        { error: 'No input data provided' },
        { status: 400 }
      );
    }

    // Process each input with both prompts
    const results: ComparisonResult[] = [];

    for (const input of inputs) {
      const result: ComparisonResult = {
        inputId: input.id,
        input: input.data,
        promptAOutput: '',
        promptBOutput: '',
        timestamp: new Date().toISOString(),
      };

      // Execute Prompt A
      try {
        result.promptAOutput = await executePrompt(
          config.model,
          config.systemPrompt,
          config.promptA,
          input.data
        );
      } catch (error: unknown) {
        result.promptAError = error instanceof Error ? error.message : 'Unknown error executing Prompt A';
      }

      // Execute Prompt B
      try {
        result.promptBOutput = await executePrompt(
          config.model,
          config.systemPrompt,
          config.promptB,
          input.data
        );
      } catch (error: unknown) {
        result.promptBError = error instanceof Error ? error.message : 'Unknown error executing Prompt B';
      }

      results.push(result);
    }

    return NextResponse.json({ results });
  } catch (error: unknown) {
    console.error('Error in compare API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
