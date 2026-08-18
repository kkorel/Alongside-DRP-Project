package models

import java.time.LocalDateTime

case class ReturnSupportGroup(
    name: String,
    facilitatorName: String,
    scheduledDurationMinutes: Int,
    dayOfWeek: String,
    scheduledTime: String,
    description: Option[String]
)

case class ReturnParticipant(
    id: Int,
    displayName: String,
    pronouns: Option[String],
    initials: String,
    age: Option[String],
    hobbies: List[String],
    fact: String,
    role: Role,
    culturalBackground: Option[String]
)

// The control-panel roster: everyone in the database, split by role so the
// landing page can offer "become this facilitator" / "become this participant".
case class ReturnPeople(
    participants: Seq[ReturnParticipant],
    facilitators: Seq[ReturnParticipant]
)

case class ReturnGroupMessage(
    id: Int,
    body: String,
    createdAt: LocalDateTime
)

case class ReturnFacilitatorMessage(
    fromId: Int,
    toId: Int,
    body: String,
    createdAt: LocalDateTime
)

case class ReturnSupportLink(
    id: Int,
    title: String,
    url: String,
    description: Option[String]
)

case class ReturnMeditationPlaylist(
    title: String,
    description: Option[String],
    spotifyUrl: String,
    trackCount: Option[Int]
)

case class ReturnDoodle(
    id: Int,
    imageData: String,
    sharedWithFacilitator: Boolean,
    createdAt: LocalDateTime
)

case class ReturnReflectionResponse(
    id: Int,
    groupId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    sharedWithFacilitator: Boolean,
    createdAt: LocalDateTime,
    sharedAt: Option[String]
)

case class ReturnOnboarding(
    participantId: Int,
    callName: String,
    pronouns: Option[String],
    age: Option[String],
    fact: String,
    hobbies: List[String],
    culturalBackground: Option[String],
    griefRecency: Option[String],
    whoLost: Option[String]
)

// ---- facilitator-side views -------------------------------------------------

// A member as it appears on a group card / placement list (no carried-loss here).
case class ReturnFacilitatorMember(
    id: Int,
    displayName: String,
    initials: String,
    pronouns: Option[String],
    role: Role
)

// A group the facilitator holds, with its members.
case class ReturnFacilitatorGroup(
    groupId: Int,
    name: String,
    dayOfWeek: String,
    scheduledTime: String,
    scheduledDurationMinutes: Int,
    creationTime: LocalDateTime,
    description: Option[String],
    members: Seq[ReturnFacilitatorMember]
)

// The full facilitator read of a person — includes the carried loss (for their
// eyes only). groupId is set when the person is already placed.
case class ReturnFacilitatorParticipant(
    id: Int,
    displayName: String,
    pronouns: Option[String],
    age: Option[String],
    initials: String,
    fact: String,
    hobbies: List[String],
    culturalBackground: Option[String],
    griefRecency: Option[String],
    whoLost: Option[String],
    role: Role,
    onboardingTime: LocalDateTime,
    groupId: Option[Int]
)

// Facilitator's free-form notes about a group (only visible to the facilitator).
case class ReturnGroupNotes(notes: String, updatedAt: LocalDateTime)

// One row of the room's "privately with you" rail: the member, the last private
// message, and the sections of their reflection they chose to share.
case class ReturnInboxEntry(
    participant: ReturnFacilitatorMember,
    lastMessageBody: Option[String],
    lastMessageFromId: Option[Int],
    lastMessageAt: Option[LocalDateTime],
    hasUnread: Boolean,
    sharedPrivateNote: Option[String],
    sharedFacilitatorNote: Option[String],
    sharedFreeWriting: Option[String],
    lastReflectionShareAt: Option[LocalDateTime]
)

case class ReturnIsSessionNow(
    isSessionNow: Boolean,
    sessionClosedForWeek: Boolean
)

case class ReturnNotePrompts(
    creationReason: String,
    safeguardingConcerns: String
)

case class ReturnIcebreakers(
    choice: Weather,
    description: Option[String],
    time: LocalDateTime
)
