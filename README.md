# Prompt Comparison Tool

A modern web application for comparing the performance and output differences between two prompt variations when applied to the same dataset. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Multi-Provider Support**: Test prompts across Anthropic Claude, OpenAI GPT, and Google Gemini
- **CSV Data Import**: Upload CSV files containing your test data
- **Side-by-Side Comparison**: View outputs from both prompts simultaneously
- **Diff Highlighting**: Visual highlighting of differences between outputs
- **Export Results**: Download comparison results as JSON for further analysis
- **Real-time Processing**: Process multiple inputs and see results as they complete

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **LLM Integrations**:
  - Anthropic SDK
  - OpenAI SDK
  - Google Generative AI SDK
- **Data Processing**: PapaParse for CSV handling
- **Diff Visualization**: diff library for text comparison

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API keys from at least one of the following providers:
  - [Anthropic](https://console.anthropic.com/)
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Google AI](https://makersuite.google.com/app/apikey)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
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
   GOOGLE_API_KEY=your_google_api_key_here
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### 1. Prepare Your Data

Create a CSV file with your test data. The tool will automatically detect the data column, or you can use columns named: `text`, `data`, `content`, or `input`.

Example CSV:
```csv
text
"Extract key skills from this resume: Software Engineer with 5 years of experience in React, Node.js, and AWS."
"Identify the main technologies: Full-stack developer skilled in Python, Django, PostgreSQL, and Docker."
```

### 2. Configure Your Test

1. **Upload CSV**: Click "Upload CSV File" and select your data file
2. **Select Model**: Choose from Anthropic Claude, OpenAI GPT, or Google Gemini
3. **System Prompt (Optional)**: Add any system-level instructions
4. **Prompt A**: Enter your first prompt variation
5. **Prompt B**: Enter your second prompt variation

### 3. Run Comparison

Click "Run Comparison" to execute both prompts against all inputs. The tool will:
- Process each row in your CSV
- Execute Prompt A and Prompt B for each input
- Capture outputs and any errors
- Display results in a comparison view

### 4. Analyze Results

- Navigate through results using the dropdown selector
- View inputs and outputs side-by-side
- See highlighted differences between outputs
- Export results as JSON for further analysis

## Example Use Case

**Scenario**: Testing resume parsing prompts

**CSV Data**:
```csv
text
"Software Engineer with expertise in React, TypeScript, and Node.js"
"Data Scientist skilled in Python, Machine Learning, and SQL"
```

**Prompt A**:
```
Extract all technical skills mentioned in the text. Return as a comma-separated list.
```

**Prompt B**:
```
Identify the technical skills from the text. Format as a JSON array of skill objects with "name" and "category" fields.
```

**Result**: Compare which prompt provides more structured, accurate, or useful outputs.

## Project Structure

```
evalengine/
├── app/
│   ├── api/
│   │   ├── compare/route.ts      # Comparison execution endpoint
│   │   └── parse-csv/route.ts    # CSV parsing endpoint
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

### POST /api/parse-csv

Parses an uploaded CSV file and converts it to the input format.

**Request**: FormData with CSV file

**Response**:
```json
{
  "inputs": [
    {
      "id": "row-0",
      "data": "text content",
      "metadata": { ... }
    }
  ]
}
```

### POST /api/compare

Executes both prompts against all inputs.

**Request**:
```json
{
  "config": {
    "systemPrompt": "optional system prompt",
    "promptA": "first prompt",
    "promptB": "second prompt",
    "model": "anthropic"
  },
  "inputs": [...]
}
```

**Response**:
```json
{
  "results": [
    {
      "inputId": "row-0",
      "input": "original text",
      "promptAOutput": "output from prompt A",
      "promptBOutput": "output from prompt B",
      "timestamp": "2025-10-21T..."
    }
  ]
}
```

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

### CSV Parsing Issues

If CSV upload fails:
1. Ensure the file is valid CSV format
2. Check that at least one column contains text data
3. Try naming your data column as "text", "data", or "content"

### Model Selection

Different models have different capabilities and pricing:
- **Anthropic Claude**: Best for complex reasoning and long contexts
- **OpenAI GPT**: Fast and versatile
- **Google Gemini**: Good balance of speed and quality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
