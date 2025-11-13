# Resume Skills Extraction - Prompt Comparison Tool

A modern web application for comparing two prompt variations when extracting skills from PDF resumes. Built with Next.js, TypeScript, and Tailwind CSS. Compare outputs from Anthropic Claude and OpenAI GPT models side-by-side.

## Features

- **PDF Resume Upload**: Upload one or multiple PDF resumes (1-2 pages each)
- **Multi-Provider Support**: Test prompts across Anthropic Claude and OpenAI GPT
- **Specific Model Selection**: Choose from the latest models:
  - **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, and more
  - **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Side-by-Side Comparison**: View skills extraction from both prompts simultaneously
- **Diff Highlighting**: Visual highlighting of differences between outputs
- **Export Results**: Download comparison results as JSON for further analysis
- **Multiple Resume Processing**: Process multiple resumes in a single batch

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **LLM Integrations**:
  - Anthropic SDK
  - OpenAI SDK
- **PDF Processing**: pdfjs-dist for text extraction
- **Diff Visualization**: diff library for text comparison

## Use Case

This tool is designed for testing different prompt variations for extracting technical skills from resumes. For example:

- **Prompt A**: "Extract all technical skills as a comma-separated list"
- **Prompt B**: "Identify technical skills and format as JSON with categories"

Compare which prompt provides better results for your specific needs.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys from at least one provider:
  - [Anthropic](https://console.anthropic.com/)
  - [OpenAI](https://platform.openai.com/api-keys)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pupase/evalengine.git
   cd evalengine
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your API keys:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Upload PDF Resume(s)

- Click "Upload PDF Resume(s)"
- Select one or more PDF files (1-2 pages each)
- The tool will extract text from all pages

### 2. Select Model

1. **Choose Provider**: Anthropic (Claude) or OpenAI (GPT)
2. **Select Specific Model**: Pick from available models
   - Anthropic: Claude 3.5 Sonnet (Latest), Claude 3.5 Haiku, Claude 3 Opus, etc.
   - OpenAI: GPT-4o (Latest), GPT-4o Mini, GPT-4 Turbo, etc.

### 3. Configure Prompts

1. **System Prompt (Optional)**: Add context like "You are an expert at analyzing resumes..."
2. **Prompt A**: Enter your first skills extraction prompt
3. **Prompt B**: Enter your alternative skills extraction prompt

### 4. Run Comparison

Click "Run Comparison" to execute both prompts against all uploaded resumes.

### 5. Analyze Results

- Navigate through results for each resume
- View inputs and outputs side-by-side
- See highlighted differences between outputs
- Export results as JSON for further analysis

## Example Prompts

### Prompt A - Simple List
```
Extract all technical skills from this resume. Return as a comma-separated list.
```

### Prompt B - Structured JSON
```
Identify all technical skills from this resume. Format as a JSON array with each skill having:
{
  "name": "skill name",
  "category": "programming language | framework | tool | cloud platform | database"
}
```

## Project Structure

```
evalengine/
├── app/
│   ├── api/
│   │   ├── compare/route.ts      # Comparison execution endpoint
│   │   └── parse-pdf/route.ts    # PDF parsing endpoint
│   ├── layout.tsx
│   └── page.tsx                  # Main application UI
├── components/
│   ├── DiffViewer.tsx            # Diff visualization component
│   └── ResultsView.tsx           # Results display component
├── lib/
│   └── llm-providers.ts          # LLM provider integrations
├── types/
│   └── index.ts                  # TypeScript type definitions
├── .env.example                  # Environment variables template
├── package.json
└── README.md
```

## API Routes

### POST /api/parse-pdf

Parses uploaded PDF files and extracts text.

**Request**: FormData with multiple PDF files

**Response**:
```json
{
  "inputs": [
    {
      "id": "resume-0",
      "data": "extracted text content",
      "filename": "resume.pdf",
      "metadata": {
        "filename": "resume.pdf",
        "pages": "2",
        "size": "245678"
      }
    }
  ]
}
```

### POST /api/compare

Executes both prompts against all inputs using the selected model.

**Request**:
```json
{
  "config": {
    "systemPrompt": "optional system prompt",
    "promptA": "first prompt",
    "promptB": "second prompt",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022"
  },
  "inputs": [...]
}
```

**Response**:
```json
{
  "results": [
    {
      "inputId": "resume-0",
      "input": "original resume text",
      "promptAOutput": "output from prompt A",
      "promptBOutput": "output from prompt B",
      "timestamp": "2025-10-21T..."
    }
  ]
}
```

## Available Models

### Anthropic Claude
- **claude-3-5-sonnet-20241022**: Claude 3.5 Sonnet (Latest)
- **claude-3-5-haiku-20241022**: Claude 3.5 Haiku
- **claude-3-opus-20240229**: Claude 3 Opus
- **claude-3-sonnet-20240229**: Claude 3 Sonnet
- **claude-3-haiku-20240307**: Claude 3 Haiku

### OpenAI GPT
- **gpt-4o**: GPT-4o (Latest)
- **gpt-4o-mini**: GPT-4o Mini
- **gpt-4-turbo**: GPT-4 Turbo
- **gpt-4**: GPT-4
- **gpt-3.5-turbo**: GPT-3.5 Turbo

## Building for Production

```bash
npm run build
npm start
```

## Troubleshooting

### API Key Errors

If you see errors like "API_KEY not configured":
1. Verify your `.env` file exists and has the correct API keys
2. Restart the development server after adding environment variables
3. Ensure the API key format is correct (no extra quotes or spaces)

### PDF Parsing Issues

If PDF upload fails:
1. Ensure files are valid PDF format (not scanned images)
2. Check that PDFs contain selectable text (not image-only PDFs)
3. Try converting image-based PDFs using OCR first

### Model Selection

Different models have different capabilities and pricing:
- **Claude 3.5 Sonnet**: Best for complex reasoning and nuanced extraction
- **Claude 3.5 Haiku**: Faster, cost-effective for simpler tasks
- **GPT-4o**: Latest OpenAI model with strong performance
- **GPT-4o Mini**: Faster and more cost-effective option
- **GPT-3.5 Turbo**: Budget-friendly for simpler extraction tasks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
