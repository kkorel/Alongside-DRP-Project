# Alongside

[![CI](https://github.com/kkorel/Alongside-DRP-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/kkorel/Alongside-DRP-Project/actions/workflows/ci.yml)

## What it does

Alongside is a prototype web app for facilitated peer-support groups for bereaved young adults, built as a Designing for Real People course project.

Many bereaved young adults want support from people with a similar experience but do not know where to find it, feel awkward raising grief with friends again, or find formal services hard to enter. Alongside gives a small group a scheduled chat room run by a facilitator, a private line to that facilitator, and a quiet space to write, breathe, doodle, or find support links, and gives the facilitator a dashboard to create groups, place new arrivals, keep notes, and open or end each session. It is a prototype with no authentication and demo people seeded by the database migrations, and a deployed copy runs at [drp-07.vercel.app](https://drp-07.vercel.app) against the API at `drp07-production.up.railway.app`.

## Quickstart

Use JDK 21 and Node.js 22, the versions CI runs, plus sbt and a PostgreSQL server that accepts SSL connections. The backend appends `sslmode=require` to the JDBC URL, so a server without SSL is refused with "The server does not support SSL".

Start the backend. It listens on port 9000. The first request compiles the app and applies the Flyway migrations, which create the schema and seed the demo data.

```bash
git clone https://github.com/kkorel/Alongside-DRP-Project.git
cd Alongside-DRP-Project/backend
export DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE"
sbt run
```

Start the frontend in a second terminal, then open http://localhost:3000.

```bash
cd Alongside-DRP-Project/frontend
npm ci
npm run dev
```

The seed data gives you one facilitator, Sean (id 8), who holds "Monday Group" with participants 1 to 7 and an empty "Sunday Mornings", plus five participants (ids 9 to 13) waiting to be placed in a group.

## Usage

### Step into a seeded person

There is no login. The front page lists everyone in the database and you pick who to be. The choice travels in the URL as `?pid=<id>` for a participant or `?fid=<id>` for a facilitator, and pages without an id fall back to participant 1 and facilitator 8.

```text
http://localhost:3000/dashboard?pid=1          Amber's dashboard
http://localhost:3000/onboarding/intro?pid=1   Amber's onboarding survey
http://localhost:3000/facilitator?fid=8        Sean's facilitator dashboard
```

As a participant you fill in the onboarding survey, keep a daily weather check-in on the dashboard, join the group chat while the facilitator has the room open, message the facilitator privately, and step into the quiet space (free or guided writing, breathing, a noticing exercise, meditation playlists, a doodle pad, and support links) with a way back to the room. As a facilitator you create and edit groups, place arrivals into them, read private messages and the reflections participants chose to share, keep private notes per group, and open or end the session. Participants can join only while the room is open and before the scheduled end time, and a session ended on its meeting day stays closed until the next one.

### Call the API directly

The backend is a JSON API with no authentication. Every route is listed in `backend/conf/routes`.

```bash
curl http://localhost:9000/people
curl http://localhost:9000/groups/1
curl "http://localhost:9000/facilitator/groups?facilitatorId=8"
curl -X POST http://localhost:9000/groups/1/messages \
  -H "Content-Type: application/json" \
  -d '{"participantId":1,"body":"Hello everyone"}'
```

The message POST returns 201. A blank body returns 400 with `{"error":"Message failed"}`. The backend only answers requests whose Host header is `localhost:9000`, `127.0.0.1:9000`, or the Railway host, and only allows the browser origins `http://localhost:3000` and `https://drp-07.vercel.app`. Both lists are fixed in `backend/conf/application.conf`.

## Configuration

| Variable | Read by | Required | Default | Purpose |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Backend, both `sbt run` and the Docker image | Yes | None. Startup fails without it | `postgres://user:password@host:port/database`, converted to a JDBC URL with `sslmode=require` |
| `PLAY_HTTP_SECRET_KEY` | Docker image only | Yes | None. The app refuses to start in production mode without it | Play application secret. `sbt run` does not need it |
| `PORT` | Docker image only | No | `9000` | HTTP port inside the container. Requests still need an allowed Host header, see above |
| `NEXT_PUBLIC_API_URL` | Frontend | No | `http://localhost:9000` | Backend base URL, inlined by Next.js at build or dev start. Set it in `frontend/.env.local`, which is gitignored |

## Development

The backend is Play 3.0 on Scala 3.7 with Slick for database access and Flyway for migrations. The frontend is Next.js 16 with React 19, TypeScript, and Tailwind CSS 4.

From `backend/`:

```bash
sbt compile
sbt scalafmtCheckAll scalafmtSbtCheck   # formatting check, as CI runs it
sbt scalafmtAll scalafmtSbt             # reformat
sbt stage                               # production build: target/universal/stage/bin/play-scala-seed
```

From `frontend/`:

```bash
npm ci
npm run lint
npm run build
npm run start   # serve the production build on port 3000
```

There are no automated tests. CI in `.github/workflows/ci.yml` runs the backend job (compile, formatting check, `Test/compile`) on every push and pull request, and the frontend job (`npm ci`, lint, build) on pull requests and pushes to `main`.

To change the schema, add the next numbered file to `backend/conf/db/migration/`. The latest is `V30__create_dashboard_table.sql`. Flyway applies pending migrations when the backend starts. Slick table definitions live in `backend/app/repositories/tables/`.

The backend Dockerfile builds the staged binary and runs it with `PORT` and `PLAY_HTTP_SECRET_KEY`:

```bash
docker build -t alongside-backend backend
docker run -p 9000:9000 \
  -e DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE" \
  -e PLAY_HTTP_SECRET_KEY="a-long-random-string" \
  alongside-backend
```

Repository layout:

```text
backend/app/controllers/      Play controllers, one per feature area
backend/app/repositories/     Slick queries and table definitions
backend/app/models/           Case classes and JSON formats
backend/conf/routes           Every API route
backend/conf/db/migration/    Flyway migrations V1 to V30, schema and seed data
frontend/app/                 Next.js App Router pages and components
frontend/app/lib/             API client, identity handling, navigation config
frontend/app/facilitator/     Facilitator dashboard
frontend/app/(quiet)/         Quiet space: write, calm, draw, resources
PRODUCT_SPEC.md               Original walking-skeleton spec
AGENTS.md                     Conventions for coding agents
```

## License

[MIT](LICENSE).
