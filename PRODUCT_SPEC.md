# Product Spec: Peer Support Group Walking Skeleton

## Problem context

Many bereaved young adults want reliable and convenient formal support from people with shared experiences, but may not know where to access it, may feel awkward bringing grief up repeatedly with friends, or may need support at moments when formal services feel hard to enter.

## Current prototype goal

Build a single-user prototype of a facilitated peer-support chat room.

The prototype should demonstrate the core interaction:
A participant joins a group, writes messages, can privately contact the facilitator, can see who else is in the room, and can step away into a quiet reflection space.

## Primary user

A bereaved young adult aged roughly 18–25 who is early in grief or still processing grief, socially surrounded but emotionally unsupported, and unsure how to access the right support.

## Core user flow

1. User enters “Monday Group”.
2. User sees the group chat and facilitator context.
3. User hovers over “7 people” to see who is in the room.
4. User clicks a participant to see their About me and Fun fact.
5. User sends a group message.
6. User privately messages the facilitator.
7. User enters a quiet reflection room.
8. User writes reflections.
9. User can share the reflection with the facilitator.
10. User can go back to the main chat room.

## MVP user stories

1. As a participant, I want to see the group context so that I understand where I am and who is facilitating.
2. As a participant, I want to send a message to the group so that I can take part when I feel ready.
3. As a participant, I want my messages to be saved so that the session has continuity.
4. As a participant, I want to see who else is in the room so that the space feels human.
5. As a participant, I want to click someone’s name to learn a little about them before speaking.
6. As a participant, I want to directly message the facilitator so that I can ask for help without posting publicly.
7. As a participant, I want to step into a quiet reflection space so that I can pause without fully leaving the group.
8. As a participant, I want to go back from the quiet room to the main chat so that the breakout room does not feel like an exit.

## Non-goals for now

- Authentication
- Real video/audio calls
- Real crisis escalation
- Full facilitator dashboard
- Multi-group scheduling
- Notifications
- AI therapy or automated counselling
- Complex WebSocket infrastructure