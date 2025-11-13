import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { ModelProvider, ModelName, AnthropicModel, OpenAIModel } from '@/types';

export async function executePrompt(
  provider: ModelProvider,
  model: ModelName,
  systemPrompt: string | undefined,
  userPrompt: string,
  input: string
): Promise<string> {
  const fullPrompt = `${userPrompt}\n\nInput:\n${input}`;

  switch (provider) {
    case 'anthropic':
      return executeAnthropicPrompt(model as AnthropicModel, systemPrompt, fullPrompt);
    case 'openai':
      return executeOpenAIPrompt(model as OpenAIModel, systemPrompt, fullPrompt);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function executeAnthropicPrompt(
  model: AnthropicModel,
  systemPrompt: string | undefined,
  userPrompt: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model,
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
  model: OpenAIModel,
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
    model,
    messages,
    max_tokens: 4096,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return content;
}
