# GeoChat — Map-anchored conversations

GeoChat is a geolocated chat web application where conversations are created directly on an interactive map.

## Main features:

1. Thematic channels — Conversations are organized by activity: General, Mountain skiing, Climbing, Trail running, Hiking and
Mountain biking.
2. Interactive map — Explore conversations by navigating the map. Click on any point to start a new conversation at those coordinates.
3. Real-time chat — Messages appear instantly without the need to reload the page.
4. Reactions — Mark messages as interesting (thumbs up) or not interesting (thumbs down). The counters are visible to all participants.
5. Pinned messages — Pin up to 3 important messages per conversation to always have them at hand at the top of the chat. Pinned messages are personal and private.
6. Dual Search — Search for geographic locations (mountains, towns, etc.) or existing conversations by title.
7. Share conversations — Share any conversation via link, email, or WhatsApp.
8. Safe links — External links in messages require confirmation before opening.
9. Offline mode — Messages are saved locally and sent automatically when internet connection is restored.
10. Outdoor accessibility — High contrast mode for visibility in sunlight, adjustable text size (normal, large, extra large), and reduced motion option.
11. No registration — Instant participation with automatically generated random name. No entry barriers.

# GeoChat — Conversaciones ancladas al mapa                                                                                        
                                                                                                                                 
GeoChat es una aplicación web de chat geolocalizado donde las conversaciones se crean directamente sobre un mapa interactivo.

## Funcionalidades principales:

1. Canales temáticos — Las conversaciones se organizan por actividad: General, Esquí de montaña, Escalada, Trail running,
Senderismo y Mountain bike.
2. Mapa interactivo — Explora conversaciones navegando por el mapa. Haz clic en cualquier punto para iniciar una nueva
conversación en esas coordenadas.
3. Chat en tiempo real — Los mensajes aparecen instantáneamente sin necesidad de recargar la página.
4. Reacciones — Marca mensajes como interesantes (pulgar arriba) o no interesantes (pulgar abajo). Los contadores son visibles
para todos los participantes.
5. Mensajes fijados — Fija hasta 3 mensajes importantes por conversación para tenerlos siempre a mano en la parte superior del
chat. Los fijados son personales y privados.
6. Búsqueda dual — Busca lugares geográficos (montañas, localidades, etc) o conversaciones existentes por título.
7. Compartir conversaciones — Comparte cualquier conversación por enlace, email o WhatsApp.
8. Enlaces seguros — Los enlaces externos en los mensajes requieren confirmación antes de abrirse.
9. Modo sin conexión — Los mensajes se guardan localmente y se envían automáticamente cuando se recupera la conexión a internet.
10. Accesibilidad para exteriores — Modo de alto contraste para visibilidad al sol, tamaño de texto ajustable (normal, grande,
extra grande) y opción de movimiento reducido.
11. Sin registro — Participación inmediata con nombre aleatorio generado automáticamente. Sin barreras de entrada.

# GeoChat — Converses ancorades al mapa

GeoChat és una aplicació web de xat geolocalitzat on les converses es creen directament sobre un mapa interactiu.

## Funcionalitats principals:

1. Canals temàtics — Les converses s'organitzen per activitat: General, Esqui de muntanya, Escalada, Trail running, Senderisme i
Mountain bike.
2. Mapa interactiu — Explora converses navegant pel mapa. Fes clic a qualsevol punt per iniciar una nova conversa en aquelles coordenades.
3. Xat en temps real — Els missatges apareixen instantàniament sense necessitat de recarregar la pàgina.
4. Reaccions — Marca missatges com a interessants (polze amunt) o no interessants (polze avall). Els comptadors són visibles per a tots els participants.
5. Missatges fixats — Fixa fins a 3 missatges importants per conversa per tenir-los sempre a mà a la part superior del xat. Els fixats són personals i privats.
6. Cerca dual — Cerca llocs geogràfics (muntanyes, localitats, etc) o converses existents per títol.
7. Compartir converses — Comparteix qualsevol conversa per enllaç, correu electrònic o WhatsApp.
8. Enllaços segurs — Els enllaços externs als missatges requereixen confirmació abans d'obrir-se.
9. Mode sense connexió — Els missatges es guarden localment i s'envien automàticament quan es recupera la connexió a internet.
10. Accessibilitat per a exteriors — Mode d'alt contrast per a visibilitat al sol, mida de text ajustable (normal, gran, extragran) i opció de moviment reduït.
11. Sense registre — Participació immediata amb nom aleatori generat automàticament. Sense barreres d'entrada.

# GeoChat — Conversations géolocalisées

GeoChat est une application web de chat géolocalisé où les conversations se déroulent directement sur une carte interactive.

## Fonctionnalités principales :

1. Canaux thématiques — Les conversations sont organisées par activité : Général, Ski alpin, Escalade, Trail, Randonnée et
VTT.
2. Carte interactive — Explorez les conversations en naviguant sur la carte. Cliquez sur un point pour démarrer une nouvelle conversation à ces coordonnées.
3. Chat en temps réel — Les messages s'affichent instantanément, sans rechargement de la page.
4. Réactions — Indiquez si un message vous intéresse (pouce levé) ou non (pouce baissé). Les compteurs sont visibles par tous les participants.
5. Messages épinglés — Épinglez jusqu'à 3 messages importants par conversation pour les avoir toujours à portée de main en haut du chat. Les messages épinglés sont personnels et privés.
6. Double recherche — Recherchez des lieux géographiques (montagnes, villes, etc.) ou des conversations existantes par titre. 7. Partagez vos conversations — Partagez n’importe quelle conversation par lien, e-mail ou WhatsApp.
8. Liens sécurisés — Les liens externes dans les messages nécessitent une confirmation avant ouverture.
9. Mode hors ligne — Les messages sont enregistrés localement et envoyés automatiquement dès que la connexion Internet est rétablie.
10. Accessibilité en extérieur — Mode contraste élevé pour une visibilité optimale en plein soleil, taille du texte ajustable (normale, grande, très grande) et option de réduction des mouvements.
11. Aucune inscription — Participation instantanée avec un nom aléatoire généré automatiquement. Aucun obstacle à l’entrée.

---

# Technical Documentation

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2.35 |
| UI | React | 18+ |
| Language | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS | 3.4.1 |
| Font | Nunito (next/font/google) | — |
| Mapping | Leaflet + react-leaflet | 1.9.4 / 4.2.1 |
| Map tiles | OpenTopoMap | — |
| Database | Supabase (PostgreSQL + PostGIS) | 2.97.0 (client) |
| Realtime | Supabase postgres_changes | — |
| Offline storage | IndexedDB (idb) | 8.0.3 |
| PWA | Service Worker + Cache API | — |
| i18n | next-intl | 4.8.3 |
| Geocoding | Nominatim (OpenStreetMap) | — |
| Linting | ESLint (next/core-web-vitals) | 8+ |

## Project Structure

```
src/
├── app/                          # Next.js 14 App Router
│   ├── layout.tsx                # Root layout (fonts, PWA metadata, providers)
│   ├── page.tsx                  # Home page (channel grid)
│   ├── manifest.ts               # PWA manifest generator
│   └── channel/[slug]/
│       └── page.tsx              # Channel page (map + conversation panel)
├── components/                   # React components (~25 files)
│   ├── map-inner.tsx             # Map interaction logic (markers, click-to-create)
│   ├── message-list.tsx          # Message display with cursor-based pagination
│   ├── message-input.tsx         # Message composition
│   ├── conversation-panel.tsx    # Chat panel (messages, search, pins)
│   ├── reaction-buttons.tsx      # Thumbs up/down reactions
│   ├── pinned-messages.tsx       # Pin management (localStorage-based)
│   ├── location-search.tsx       # Nominatim geocoding integration
│   ├── share-button.tsx          # Share via link/email/WhatsApp
│   ├── accessibility-settings-panel.tsx  # Contrast, text size, motion
│   ├── i18n-provider.tsx         # next-intl client provider
│   ├── sw-register.tsx           # Service worker registration
│   └── ...
├── hooks/                        # Custom React hooks (~16 files)
│   ├── use-messages.ts           # Fetch + realtime subscription
│   ├── use-reactions.ts          # Reactions with offline queue
│   ├── use-conversations.ts      # Spatial queries (viewport bounds)
│   ├── use-channels.ts           # Channel list with caching
│   ├── use-pins.ts               # Pin state (localStorage)
│   ├── use-send-message.ts       # Send with offline fallback
│   ├── use-offline-cache.ts      # IndexedDB cache management
│   ├── use-online-status.ts      # Network detection
│   ├── use-pending-messages.ts   # Offline message queue + sync
│   └── ...
├── lib/                          # Shared utilities
│   ├── supabase.ts               # Supabase client init
│   ├── offline-db.ts             # IndexedDB schema + CRUD operations
│   ├── i18n.ts                   # Locale detection + message loading
│   ├── linkify.ts                # URL detection in message text
│   └── accessibility.ts          # Accessibility preference types
├── types/
│   └── index.ts                  # TypeScript interfaces (Channel, Conversation, Message, Reaction, etc.)
└── messages/                     # i18n translation files
    ├── en.json                   # English (source of truth)
    ├── es.json                   # Spanish
    ├── fr.json                   # French
    ├── ca.json                   # Catalan
    └── .tracking.json            # Translation sync state (SHA1 hashes)

supabase/
└── migrations/                   # 8 SQL migration files (PostGIS, tables, RPC, RLS, channels, reactions)

public/
├── sw.js                         # Service worker (tile + asset caching)
├── logo.png
└── icons/                        # PWA icons (192x192, 512x512)

scripts/
└── translate.mjs                 # i18n tracking script (missing/stale/orphan keys)
```

## Database Schema (PostgreSQL + PostGIS)

### Tables

**channels** — Topic categories for conversations
- `id` UUID PK, `name`, `slug` (unique), `description`, `icon`, `sort_order`, `is_active`
- 6 seeded channels: General, Skimo, Rock Climbing, Trail Running, Hiking, Mountain Biking

**conversations** — Map-anchored chat threads
- `id` UUID PK, `title` (120 chars), `channel_id` FK, `lat`, `lon`, `location` (GEOGRAPHY Point, auto-populated via trigger)
- `creator_name`, `message_count` (denormalized), `last_message_at`, `created_at`
- Spatial GIST index on `location`

**messages** — Chat messages within conversations
- `id` UUID PK, `conversation_id` FK, `author_name`, `body` (2000 chars), `created_at`
- Composite index on `(conversation_id, created_at DESC)`

**message_reactions** — Thumbs up/down on messages
- `id` UUID PK, `message_id` FK, `conversation_id` FK, `user_session_id`, `reaction_type`
- Unique constraint: one reaction per user per message

### RPC Functions

- `conversations_in_bounds(min_lng, min_lat, max_lng, max_lat, p_channel_id?)` — Viewport-based spatial query
- `conversations_nearby(lng, lat, radius_meters, p_channel_id?)` — Proximity query (default 1000m)
- `messages_for_conversation(conv_id, page_size, before_timestamp)` — Cursor-based pagination

### Security

- Row Level Security (RLS) enabled on all tables
- Anonymous access: public SELECT + INSERT on conversations, messages, and reactions
- Channels: public SELECT only (admin-managed)
- Realtime publication enabled for messages, reactions, and channels

## Architecture

### Routing

- `/` — Home page with channel grid and settings
- `/channel/[slug]` — Channel detail with interactive map and conversation panel

### Data Flow

1. **Map viewport changes** — `use-conversations` calls `conversations_in_bounds` RPC — markers rendered on map
2. **User clicks marker** — conversation panel opens — `use-messages` fetches with cursor pagination + subscribes to realtime
3. **User sends message** — optimistic UI update — Supabase insert — trigger updates conversation stats — realtime broadcast
4. **Reactions** — optimistic toggle — Supabase upsert/delete — realtime sync to all participants

### Offline Strategy

- **Service Worker** (`public/sw.js`): cache-first for OpenTopoMap tiles (max 2000 entries, ~50 MB) and Next.js static assets; network-only for API calls
- **IndexedDB** (`src/lib/offline-db.ts`): caches channels, conversations, and messages locally; queues pending messages and reactions
- **Sync flow**: on reconnect, pending items are sent to Supabase and realtime subscriptions are re-established
- **Tile fallback**: grey 256x256 placeholder when offline and tile not cached

### Internationalization

4 locales: English (en), Spanish (es), French (fr), Catalan (ca). English is the source of truth.

```bash
npm run i18n              # Show missing/stale/orphan keys per locale
npm run i18n -- --sync    # Snapshot hashes after updating translations
```

### Accessibility

- **High contrast mode** — improved visibility in sunlight
- **Text size** — 3 levels: default, large, extra-large
- **Reduced motion** — disables animations
- Preferences stored in `localStorage` (`geochat_accessibility_prefs`)

### PWA

- Standalone display mode, installable on mobile
- Custom manifest generated via `src/app/manifest.ts`
- Service worker registered via `src/components/sw-register.tsx`
- Fresh SW on every load (`Cache-Control: no-cache` header on `/sw.js`)

## Commands

```bash
npm run dev               # Development server (localhost:3000)
npm run build             # Production build
npm start                 # Production server
npm run lint              # ESLint
npm run i18n              # Translation status report
npm run i18n -- --sync    # Sync translation tracking hashes
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Both are required and exposed to the browser (`NEXT_PUBLIC_` prefix).
