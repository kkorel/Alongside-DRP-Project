# DRP_07

DRP_07 is a full-stack prototype for exploring how bereaved young adults can request reliable, convenient formal support from people and organisations with relevant shared experience.

The current product surface is a walking skeleton of the peer-support chat experience: a Next.js frontend opens “Monday Group”, loads seeded participants and messages from the Scala Play backend, lets the user send group messages, privately message the facilitator, view participant profiles, step into a quiet reflection space, and exit the room calmly.

The older support-request API still exists in the backend, but the frontend now focuses on the peer-support group flow.

## Tech stack

| Area | Technology | Current use |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript | App Router client page for the Monday Group chat, private facilitator messages, participant profiles, quiet reflection space, and exit flow |
| Styling | Tailwind CSS 4 | Utility-first styling through `frontend/app/globals.css` |
| Backend | Play Framework 3, Scala 2.13 | JSON API for groups, participants, messages, reflections, support requests, and health checks |
| Backend DI | Guice | Eager startup binding for database migrations |
| Database | PostgreSQL | Stores support groups, participants, messages, reflections, and support requests |
| Persistence | Slick 3.5 | Repository layer for PostgreSQL reads and writes |
| Migrations | Flyway 9 | Runs `conf/db/migration` migrations at backend startup |
| Backend tests | ScalaTest + Play test | Seed controller tests |
| Deployment | Dockerfile for backend, Vercel-compatible frontend | Backend image builds an sbt stage distribution; frontend expects `NEXT_PUBLIC_API_URL` |

## Repository layout

```text
.
├── backend/drp-backend/        # Scala Play backend
│   ├── app/controllers/        # HTTP controllers
│   ├── app/models/             # API/domain models and JSON formats
│   ├── app/repositories/       # Slick database access
│   ├── app/config/             # Database and Flyway configuration
│   ├── conf/routes             # Backend routes
│   ├── conf/db/migration/      # Flyway SQL migrations
│   ├── build.sbt               # Main backend build
│   └── Dockerfile              # Backend container build
└── frontend/                   # Next.js frontend
    ├── app/page.tsx            # Monday Group chat room screen
    ├── app/layout.tsx          # App shell and metadata
    ├── app/globals.css         # Tailwind/global CSS
    └── package.json            # Frontend scripts and dependencies
```

## Prerequisites

- Node.js compatible with Next.js 16
- npm
- JDK 21
- sbt 1.12.x
- PostgreSQL database available through a `DATABASE_URL`

The backend currently reads database configuration only from `DATABASE_URL`. It expects a URL with credentials, for example:

```bash
postgres://username:password@host:5432/database_name
```

`DatabaseConfig` converts that value into a JDBC URL with `sslmode=require`, which matches hosted PostgreSQL providers. If you use a local PostgreSQL instance without SSL, this may need to be adjusted.

## Environment variables

### Backend

Set these before running the Play app:

```bash
export DATABASE_URL="postgres://username:password@host:5432/database_name"
export PLAY_HTTP_SECRET_KEY="replace-this-with-a-secure-secret"
```

`DATABASE_URL` is required for the repository and Flyway migration startup. `PLAY_HTTP_SECRET_KEY` is required for production-style runs and is also used by the Docker command.

### Frontend

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9000
```

The frontend uses this value when calling:

- `GET /groups/1`
- `GET /groups/1/participants`
- `GET /groups/1/messages`
- `POST /groups/1/messages`
- `GET /groups/1/facilitator-messages`
- `POST /groups/1/facilitator-messages`
- `POST /groups/1/reflections`
- `PATCH /reflections/:reflectionId/share`
- `GET /support-requests`
- `POST /support-requests`

## Local development workflow

### 1. Install frontend dependencies

```bash
cd frontend
npm install
```

### 2. Start the backend

```bash
cd backend/drp-backend
sbt run
```

By default, Play serves the backend at `http://localhost:9000`.

On startup, the backend eagerly runs Flyway migrations from:

```text
backend/drp-backend/conf/db/migration
```

The migrations create the original `support_requests` table plus the peer-support walking skeleton tables and seed data.

### 3. Start the frontend

In another terminal:

```bash
cd frontend
npm run dev
```

Next.js serves the frontend at `http://localhost:3000`.

## Available commands

### Frontend

Run these from `frontend/`.

```bash
npm run dev      # start the Next.js dev server
npm run build    # create a production build
npm run start    # serve the production build
npm run lint     # run ESLint
```

### Backend

Run these from `backend/drp-backend/`.

```bash
sbt run          # start the Play app
sbt test         # run backend tests
sbt clean stage  # build the staged production app used by Docker
```

There is also a `build.sc` Mill build file from the Play seed, but the maintained workflow in this repo is currently `sbt`.

## API reference

### Health check

```http
GET /health
```

Response:

```json
{ "status": "ok" }
```

### List support requests

```http
GET /support-requests
```

Returns support requests sorted by newest first.

Example response:

```json
[
  {
    "id": 1,
    "name": "Alex",
    "email": "alex@example.com",
    "supportType": "Peer support group",
    "message": "I would like to speak to someone with a similar experience.",
    "status": "open",
    "createdAt": "2026-05-28T12:00:00"
  }
]
```

### Create a support request

```http
POST /support-requests
Content-Type: application/json
```

Request body:

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "supportType": "Peer support group",
  "message": "I would like to speak to someone with a similar experience."
}
```

The backend saves new requests with:

- `status`: `open`
- `createdAt`: current backend timestamp

### Get support group

```http
GET /groups/1
```

Returns the seeded Monday Group metadata.

Example response:

```json
{
  "id": 1,
  "name": "Monday Group",
  "facilitatorName": "Sean",
  "scheduledDurationMinutes": 30,
  "createdAt": "2026-05-28T12:00:00"
}
```

### List participants

```http
GET /groups/1/participants
```

Returns seeded participant profiles with frontend-friendly fields such as `displayName`, `aboutMe`, and `funFact`.

### List group messages

```http
GET /groups/1/messages
```

Returns group chat messages sorted oldest first.

### Create group message

```http
POST /groups/1/messages
Content-Type: application/json
```

Request body:

```json
{
  "senderName": "You",
  "senderInitials": "Y",
  "body": "I am glad to be here."
}
```

Empty message bodies return `400`.

### Create facilitator direct message

```http
POST /groups/1/facilitator-messages
Content-Type: application/json
```

Request body:

```json
{
  "senderName": "You",
  "body": "Could I ask something privately?"
}
```

This route persists direct messages in `group_messages` with `messageType` set to `facilitator_direct`. The frontend button is currently visible but not wired.

### List facilitator direct messages

```http
GET /groups/1/facilitator-messages
```

Returns private facilitator messages sorted oldest first.

### Create reflection

```http
POST /groups/1/reflections
Content-Type: application/json
```

Request body:

```json
{
  "privateNote": "I need a minute to breathe.",
  "facilitatorNote": "Please check in with me after the group."
}
```

If both fields are empty, the backend returns `400`.

### Share reflection

```http
PATCH /reflections/:reflectionId/share
```

Marks a reflection as shared with the facilitator.

## Data model

The first migration creates the original support request table:

```sql
CREATE TABLE support_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    support_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

The API exposes `support_type` as `supportType` and `created_at` as `createdAt`.

The second migration creates and seeds:

- `support_groups`
- `participants`
- `group_messages`
- `reflections`

Seed data includes one group, `Monday Group`, facilitated by `Sean`, seven participants, and initial group chat messages.

## Deployment notes

### Frontend

The frontend is suitable for Vercel-style deployment. Configure:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-host
```

The backend CORS configuration currently allows:

- `http://localhost:3000`
- `https://drp-07.vercel.app`

Add any new frontend origin to `backend/drp-backend/conf/application.conf`.

When connecting from a local machine to Railway Postgres, use Railway's public proxy database URL, not the private `postgres.railway.internal` hostname. The private hostname only resolves inside Railway.

### Backend Docker image

Build from `backend/drp-backend/`:

```bash
docker build -t drp-07-backend .
```

Run with:

```bash
docker run \
  -p 9000:9000 \
  -e PORT=9000 \
  -e DATABASE_URL="postgres://username:password@host:5432/database_name" \
  -e PLAY_HTTP_SECRET_KEY="replace-this-with-a-secure-secret" \
  drp-07-backend
```

The Dockerfile builds the app with JDK 21, installs sbt through Coursier, stages the Play distribution, then runs it on a JRE 21 image.

## Current status

- Frontend Monday Group chat screen is wired to the backend group and message APIs.
- Group messages and facilitator direct messages persist and reload after refresh.
- Participant count opens a participant list, and participant profiles show About me and Fun fact details.
- Quiet reflection space can save/share reflections with the facilitator.
- Exit button attempts to close the tab and falls back to a calm “left the room” screen.
- Backend supports health checks, support requests, group metadata, participants, group messages, facilitator direct messages, listing facilitator direct messages, reflections, and sharing reflections.
- Database schema and Monday Group seed data are managed by Flyway.
- Backend startup currently requires a reachable PostgreSQL database because migrations run eagerly.
- Backend tests are still the default Play seed tests and do not yet cover the peer-support API.
