# DRP_07 Frontend

This is the Next.js frontend for DRP_07. It currently renders the “Monday Group” peer-support room and talks to the Scala Play backend through `NEXT_PUBLIC_API_URL`.

## Setup

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:9000
```

## Commands

```bash
npm run dev      # start local development on http://localhost:3000
npm run build    # build for production
npm run start    # serve the production build
npm run lint     # run ESLint
```

## Current screen

The main page at `app/page.tsx`:

- loads group metadata from `GET /groups/1`
- loads participants from `GET /groups/1/participants`
- loads messages from `GET /groups/1/messages`
- sends group messages with `POST /groups/1/messages`
- opens participant profiles from the participant list or chat sender avatars/names
- loads private facilitator messages from `GET /groups/1/facilitator-messages`
- sends private facilitator messages with `POST /groups/1/facilitator-messages`
- provides a quiet reflection view using `POST /groups/1/reflections` and `PATCH /reflections/:reflectionId/share`
- provides an exit fallback screen when browser tab closing is blocked

The “Description” control is still a visible placeholder for a later slice.

See the root `README.md` for the full repository workflow, backend setup, API routes, and deployment notes.
