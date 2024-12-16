<div align="center">
  <img src="./public/assets/logo/logo_text.svg" alt="Guilders" width="350" />
</div>

<div align="center">
  Guilders simplifies personal finance with AI.
</div>

## Requirements

- [Bun](https://bun.sh/) for package management and running the application
- [Ngrok](https://ngrok.com/) for local development tunnel
- [Supabase CLI](https://supabase.com/docs/guides/cli) for database management
- A Supabase account and project
- A Vercel account
- API keys for:
  - Resend (email service)
  - Anthropic (AI provider)
  - Umami (analytics)

## Development

### Setup

1. Clone the environment variables file and add your values:

```bash
cp .env.example .env
```

2. Install dependencies and start the server:

```bash
# Install dependencies
bun install

# Start the development server
bun dev
```

### Ngrok Setup (optional, for webhook testing)

To test callbacks and webhooks from data providers locally, you'll need Ngrok:

```bash
# Install ngrok
brew install ngrok

# Configure your auth token
ngrok config add-authtoken $NGROK_AUTH_TOKEN

# Start the tunnel (after starting your local server)
bun run ngrok
```

### Database Management

```bash
# Login to Supabase
supabase login

# Link your project
supabase link

# Pull the latest database schema
bun db:pull

# Generate TypeScript types
bun db:gen-types

# Start local Supabase Studio
bun db:start

# Seed institutions
bun db:seed
```

### Email Testing

When you start supabase locally, it will also send emails to Inbucket, which is
configured to run on `localhost:54324`. It acts as a local SMTP server and captures
all emails sent to it for inspection.

## Infrastructure

- **[Vercel](https://vercel.com)**: Handles building, hosting, deployment, and secrets management
- **[Supabase](https://supabase.com)**: Provides PostgreSQL database and authentication services
- **[Resend](https://resend.com)**: Email service provider
- **[Anthropic](https://anthropic.com)**: AI capabilities
- **[Umami](https://umami.is)**: Analytics platform
