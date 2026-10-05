# ख Khata — Personal Finance Manager

A full-stack personal finance app with AI-powered insights, built with Node.js, Supabase, and Groq AI.

## Features

- 📊 **Dashboard** — Income, expenses, savings, health score
- 💳 **Transactions** — Add and categorize expenses with natural language
- 🎯 **Goals** — Set and track financial goals with progress bars
- 🔁 **Subscriptions** — Track recurring payments, auto-added to expenses
- 📈 **Reports** — Monthly spending breakdown and trends
- 🤖 **AI Assistant** — Powered by Groq LLM for personalized financial advice

## Tech Stack

- **Frontend** — HTML, CSS, JavaScript (Vanilla)
- **Backend** — Node.js + Express
- **Database** — Supabase (PostgreSQL)
- **AI** — Groq API (GPT-OSS 20B model)

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/RajeshVvs-prog/Khata.git
cd Khata
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key
PORT=3000
```

### 3. Database Setup

Run `database-schema.sql` in your Supabase SQL Editor to create all required tables.

### 4. Run locally
```bash
node server.js
```

Open http://localhost:3000

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env` in Vercel project settings
4. Deploy!

## Environment Variables for Vercel

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `SUPABASE_SECRET_KEY` | Supabase service role key |
| `GROQ_API_KEY` | Groq API key from console.groq.com |
