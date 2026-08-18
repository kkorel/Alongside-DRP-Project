# AGENTS.md

## Project context

This repository is for a Designing for Real People project.

The product is a digital peer-support group for bereaved young adults. The current prototype focuses on a single participant’s view of a facilitated peer-support chat room.

The core experience is:
1. Join a scheduled peer-support group.
2. Send and read messages in the group chat.
3. Hover over the participant count to see who is in the room.
4. Click a participant to see their About me and Fun fact.
5. Privately message the facilitator.
6. Step into a quiet reflection/breakout room.
7. Return from the quiet reflection room back to the chat room.

This is not a generic chat app. The interaction must feel calm, safe, human, and supportive.

## Current build priority

Prioritise the walking skeleton:
frontend → backend → database → frontend.

The current sprint is not about building every feature. It is about proving the core DRP interaction works end-to-end.

## Engineering principles

- Do not rewrite the stack.
- Do not replace the existing architecture.
- Follow existing project conventions.
- Keep changes small and reviewable.
- Use Flyway migrations for database changes.
- Use Slick for database access.
- Use Play Framework routes/controllers/models in the existing backend style.
- Use Next.js, React, TypeScript, and Tailwind in the existing frontend style.
- Avoid unnecessary dependencies.
- Validate backend inputs.
- Handle loading, empty, and error states.
- Ensure lint/build/test commands pass.

## Product principles

- Use gentle, non-clinical language.
- Avoid gamification, streaks, likes, leaderboards, or reactions.
- Avoid bright social-media-style UI.
- Keep interactions low-pressure.
- Make the quiet reflection room feel private and calm.
- The quiet reflection room must always have a clear way back to the main chat.
- Do not present AI-generated advice as therapy or professional support.

## Definition of done

A task is done only when:
- The app runs locally.
- The implemented user flow works end-to-end.
- New database state persists across refresh.
- Lint/build/tests pass, or failures are clearly explained.
- The final response summarises changed files, commands run, and known limitations.