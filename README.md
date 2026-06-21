# Solana TX Explainer — Live Demo

> Paste a Solana transaction signature → get a human-readable diagnosis and suggested fix.

This is the live demo companion to the [solana-tx-debugger-skill](https://github.com/YOUR_USERNAME/solana-tx-debugger-skill). It uses the same error-decoding logic as the Claude Code skill, wrapped in a web UI.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment (optional — defaults to public RPC)
cp .env.example .env.local
# Edit .env.local to add your Helius API key for better rate limits

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add HELIUS_API_KEY
vercel env add NEXT_PUBLIC_RPC_ENDPOINT
```

Or connect the GitHub repo to Vercel dashboard for automatic deployments.

## How It Works

1. User pastes a transaction signature and selects a network
2. The app fetches the transaction via `getTransaction` with `maxSupportedTransactionVersion: true`
3. The diagnosis engine (`src/lib/diagnose.ts`) decodes the error:
   - Parses `meta.err` for error type and code
   - Matches against Anchor, SPL, Token-2022, and System error-code maps
   - Identifies the failing program from logs
4. The UI displays: error details, root cause, evidence from logs, fix with code snippet, and prevention tips

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `HELIUS_API_KEY` | No | Helius API key for enhanced RPC (better rate limits, parsed tx) |
| `NEXT_PUBLIC_RPC_ENDPOINT` | No | Custom RPC endpoint (defaults to public mainnet) |

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- @solana/web3.js

## License

MIT
