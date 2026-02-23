# Quickstart: GeoChat MVP

**Date**: 2026-02-23
**Branch**: `001-geochat-mvp`

## Prerequisites

- Node.js 18+ and npm
- A free Supabase account (https://supabase.com)
- A free Vercel account (https://vercel.com) — for deployment only

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd geochat
npm install
```

### 2. Create a Supabase project

1. Go to https://supabase.com/dashboard and create a new project.
2. Note the **Project URL** and **anon public key** from
   Settings > API.

### 3. Enable PostGIS

1. In the Supabase dashboard, go to Database > Extensions.
2. Search for "postgis" and enable it.

### 4. Run database migrations

1. Go to the SQL Editor in the Supabase dashboard.
2. Run each migration file from `supabase/migrations/` in order.

### 5. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 6. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see a full-screen
dark map.

## Verify It Works

1. **Map loads**: A full-screen dark-themed map should appear.
2. **Create a conversation**: Click anywhere on the map. Fill in a title
   and message. Submit. A marker should appear.
3. **Real-time sync**: Open a second browser tab at localhost:3000. The
   marker from step 2 should be visible. Click it, send a message, and
   verify it appears in both tabs.
4. **Proximity warning**: Click within 1 km of the conversation you just
   created. You should see a warning about the nearby conversation.

## Deploy to Vercel

1. Push your code to a GitHub repository.
2. Import the repo in Vercel (https://vercel.com/new).
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel auto-builds from `main` branch on every push.

## Project Structure

```text
src/
├── app/
│   ├── layout.tsx          # Root layout (dark theme, metadata)
│   └── page.tsx            # Main page (server component)
├── components/
│   ├── map.tsx             # Map wrapper (client, dynamic import)
│   ├── map-inner.tsx       # Leaflet map implementation
│   ├── conversation-panel.tsx  # Side panel for viewing/sending messages
│   ├── create-dialog.tsx   # Modal for creating conversations
│   ├── nearby-warning.tsx  # Proximity warning dialog
│   ├── marker.tsx          # Conversation marker component
│   ├── message-list.tsx    # Scrollable message list with pagination
│   ├── message-input.tsx   # Text input with send button
│   └── top-bar.tsx         # App name + display name
├── hooks/
│   ├── use-conversations.ts    # Fetch + subscribe to conversations
│   ├── use-messages.ts         # Fetch + subscribe to messages
│   ├── use-send-message.ts     # Optimistic send with rollback
│   ├── use-create-conversation.ts  # Create with proximity check
│   ├── use-map-viewport.ts     # Track viewport bounds, debounced
│   └── use-user-session.ts     # Display name from localStorage
├── lib/
│   └── supabase.ts         # Supabase client initialization
└── types/
    └── index.ts            # TypeScript type definitions

supabase/
└── migrations/
    ├── 001_enable_postgis.sql
    ├── 002_create_conversations.sql
    ├── 003_create_messages.sql
    ├── 004_create_rpc_functions.sql
    ├── 005_create_triggers.sql
    └── 006_enable_rls.sql
```

## Key Dependencies

| Package                           | Purpose                            |
|-----------------------------------|------------------------------------|
| next                              | React framework (App Router)       |
| react, react-dom                  | UI library                         |
| @supabase/supabase-js            | Database, auth, realtime client    |
| leaflet                           | Map rendering engine               |
| @types/leaflet                    | TypeScript types for Leaflet       |
| react-leaflet                     | React components for Leaflet       |
| leaflet-defaulticon-compatibility | Fix marker icons in bundled builds |
| tailwindcss                       | Utility-first CSS framework        |

## Naming Conventions

- **Files**: kebab-case (`conversation-panel.tsx`)
- **Components**: PascalCase (`ConversationPanel`)
- **Hooks**: camelCase with `use` prefix (`useConversations`)
- **Database columns**: snake_case (`message_count`)
- **Types**: PascalCase (`Conversation`, `Message`)
