# Next Property Finder

AI-powered property search scaffold for a Next.js App Router application.

## Folder structure

```text
next-property-finder/
  app/
    api/chat/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    property-finder-chat.tsx
    property-match-list.tsx
  lib/
    db.ts
    env.ts
    openai.ts
    prompts.ts
    property-search.ts
    query-filters.ts
    types.ts
  supabase/
    schema.sql
  .env.example
  next.config.ts
  package.json
  postcss.config.mjs
  tsconfig.json
```

## What it does

- Renders a chat UI with loading states and local chat-history persistence
- Accepts natural-language property requests
- Extracts `location`, `maxPrice`, and `bedrooms`
- Queries PostgreSQL using `DATABASE_URL`
- Reranks SQL matches with OpenAI embeddings
- Sends matched properties to OpenAI for a grounded answer

## Setup

1. Move into the app:

```bash
cd next-property-finder
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env.local
```

4. Add real values to `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres?sslmode=require
OPENAI_CHAT_MODEL=gpt-5.4-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

5. Run the database schema in Supabase SQL Editor using [supabase/schema.sql](./supabase/schema.sql).

6. Seed a few properties in the `properties` table.

7. Start the app:

```bash
npm run dev
```

## Notes

- This scaffold uses on-the-fly embeddings for the top SQL candidates to keep the schema simple.
- For production scale, precompute property embeddings and store them in PostgreSQL or a vector database.
- The API route lives at `/app/api/chat/route.ts`, as requested.
