# alongside

This is our prototype of a facilitated peer-support platform for bereaved young adults, built for the Designing for Real People course at Imperial College London. We worked on it as a group.

DRP (Designing for Real People) is a course that pairs student teams with a real problem area and asks them to build and iterate on a working prototype rather than just a design document. Our brief was peer grief support: many bereaved young adults want reliable, convenient support from people with similar experience, but don't know where to find it, feel awkward repeatedly bringing grief up with friends, or find it hard to enter formal services. `PRODUCT_SPEC.md` in this repo has the fuller problem statement and user flow we designed against.

## What it does

There's no authentication. From the front page you pick who you want to be from a list of seeded participants and facilitators, and the app carries that identity through the URL for the rest of the session.

As a participant, the flow is:

- Go through an onboarding survey (or skip straight to your dashboard if you've already done it).
- Land on a calm dashboard showing a short daily check-in, your upcoming group session, and whether the facilitator has opened the room yet.
- Once a session is open, step into the group chat room: send and read messages, hover over the participant count to see who else is in the room, and click a participant to see their "About me" and "Fun fact".
- Privately message the facilitator without posting to the group.
- Step away into a quiet reflection space at any point: guided or free writing, a breathing exercise, a short doodle pad, a meditation playlist, and a resources page. You can always return to the main chat from there, and you can save or share a written reflection with the facilitator.
- Leave the room calmly when you're done, or get a gentle notice if the facilitator ends the session while you're in it.

As a facilitator, there's a separate dashboard: create and edit support groups, see who has arrived, place participants into groups, read the private messages sent to you, view/leave notes on a group, and open or close a session.

The project outgrew the original "walking skeleton" scope in `PRODUCT_SPEC.md` along the way. That spec explicitly lists a full facilitator dashboard as a non-goal for the first prototype, but the facilitator side described above ended up getting built too.

## Tech stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Backend**: Scala, Play Framework, Guice for dependency injection.
- **Database access**: Slick, against PostgreSQL.
- **Migrations**: Flyway, run automatically on backend startup.
- **Deployment**: frontend on Vercel, backend on Railway, built from the `Dockerfile` in `backend/`.

## Repository layout

```
.
├── backend/                     # Scala Play backend
│   ├── app/controllers/         # HTTP controllers (peer support, facilitator, onboarding, quiet room, ...)
│   ├── app/models/              # API/domain models and JSON formats
│   ├── app/repositories/        # Slick database access, grouped by feature
│   ├── app/config/              # Database config and Flyway migration wiring
│   ├── conf/routes              # Backend routes
│   ├── conf/db/migration/       # Flyway SQL migrations (schema + seed data)
│   └── Dockerfile               # Backend container build
├── frontend/                    # Next.js frontend
│   ├── app/onboarding/          # Onboarding survey
│   ├── app/dashboard/           # Participant home base
│   ├── app/room/                # Group chat room
│   ├── app/(quiet)/             # Quiet reflection space (write, breathe, calm, draw, resources)
│   └── app/facilitator/         # Facilitator dashboard
├── PRODUCT_SPEC.md              # Problem statement and MVP user stories we designed against
└── LICENSE
```

## Running it locally

You need Node.js, npm, JDK 21, sbt, and a PostgreSQL database.

**Backend**

```bash
cd backend
export DATABASE_URL="postgres://username:password@host:5432/database_name"
export PLAY_HTTP_SECRET_KEY="some-secret"
sbt run
```

This starts Play on `http://localhost:9000` and runs the Flyway migrations (schema + seed data, including a seeded support group and participants) on startup. `DatabaseConfig` builds the JDBC URL from `DATABASE_URL` with `sslmode=require`, so a local Postgres instance without SSL may need adjusting.

**Frontend**

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:9000" > .env.local
npm run dev
```

This starts the frontend on `http://localhost:3000`.

## Demo

A live version is deployed at [drp-07.vercel.app](https://drp-07.vercel.app), backed by the Play API on Railway. As above, there's no login: pick someone from the list on the front page to see the app from their point of view.

## License

MIT, see `LICENSE`.
