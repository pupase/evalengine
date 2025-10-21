import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ModelProvider } from '@/types';

export async function executePrompt(
  provider: ModelProvider,
  systemPrompt: string | undefined,
  userPrompt: string,
  input: string
): Promise<string> {
  const fullPrompt = `${userPrompt}\n\nInput:\n${input}`;

  switch (provider) {
    case 'anthropic':
      return executeAnthropicPrompt(systemPrompt, fullPrompt);
    case 'openai':
      return executeOpenAIPrompt(systemPrompt, fullPrompt);
    case 'google':
      return executeGooglePrompt(systemPrompt, fullPrompt);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function executeAnthropicPrompt(
  systemPrompt: string | undefined,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Unexpected response format from Anthropic');
}

async function executeOpenAIPrompt(
  systemPrompt: string | undefined,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const client = new OpenAI({ apiKey });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  messages.push({
    role: 'user',
    content: userPrompt,
  });

  const completion = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return content;
}

async function executeGooglePrompt(
  systemPrompt: string | undefined,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('No response from Google Gemini');
  }

  return text;
}
