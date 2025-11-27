# Contributing

Thank you for your interest in contributing! This project is open source and welcomes PRs and issues.

## How to Contribute
- Open an issue describing the change/bug before large PRs
- Fork and create a feature branch (`feat/...` or `fix/...`)
- Keep changes focused and small; include description in PR
- Ensure the app builds locally: `npm install && npm run android`
- Prefer accessibility, performance, and simplicity

## Code Style
- TypeScript where possible; keep functions small
- No inline sensitive data; use environment variables (not committed)
- Follow the design system from `src/styles/theme.ts`

## Security
- Do not commit secrets (keystores, tokens, API keys)
- Report vulnerabilities privately (see `SECURITY.md`)

## License
- Contributions are made under the MIT License
