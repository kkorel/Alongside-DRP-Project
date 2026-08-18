package models

import java.time.LocalDateTime
import java.time.DayOfWeek
import java.time.LocalTime

enum Role(val show: String) {
  case PARTICIPANT extends Role("participant")
  case FACILITATOR extends Role("facilitator")
}

case class SupportGroup(
    groupId: Int,
    name: String,
    day: DayOfWeek,
    time: LocalTime,
    duration: Int, // TODO: Irontype
    creationTime: LocalDateTime,
    description: Option[String],
    hasSessionNow: Boolean,
    lastSessionEndedAt: Option[LocalDateTime]
)

/* A session can only be held once per scheduled week. Because the facilitator
   can open the room before the scheduled time, a close is attributed to the
   meeting DAY it happened on, not the scheduled minute: ending the room at any
   point on the meeting day — early, on time, or mid-session — uses up that
   week's session and locks the room until the next meeting day. The lock lifts
   at the start of that day (not the scheduled minute) so the facilitator can
   open the next session a little early too. */
object SessionWeek {
  def closedForWeek(
      day: DayOfWeek,
      lastEnded: Option[LocalDateTime],
      now: LocalDateTime
  ): Boolean =
    lastEnded.exists { ended =>
      // The meeting day of the close's own week (the meeting day at or before
      // the close), then the next meeting day a week on.
      val daysSinceMeetingDay =
        (ended.getDayOfWeek.getValue - day.getValue + 7) % 7
      val reopenDay =
        ended.toLocalDate.minusDays(daysSinceMeetingDay).plusDays(7)
      now.toLocalDate.isBefore(reopenDay)
    }

  /* True once this meeting day's scheduled end time has passed. The facilitator
     flag is the authority for starting and (early) ending a session, but the
     clock provides the upper bound: if the facilitator never ends the room, it
     closes itself at the scheduled end so a forgotten end-session can't leave it
     joinable indefinitely. Anchored to the meeting day (not the scheduled
     minute) to match how opening works — the facilitator may open the room any
     time on the meeting day, so the room stays joinable on that day right up to
     the scheduled finish. */
  def pastScheduledEnd(
      day: DayOfWeek,
      time: LocalTime,
      durationMinutes: Int,
      now: LocalDateTime
  ): Boolean = {
    val daysSinceMeetingDay = (now.getDayOfWeek.getValue - day.getValue + 7) % 7
    val scheduledEnd = now.toLocalDate
      .minusDays(daysSinceMeetingDay)
      .atTime(time)
      .plusMinutes(durationMinutes.toLong)
    now.isAfter(scheduledEnd)
  }
}

case class Participant(
    participantId: Int,
    name: String,
    pronouns: Option[String],
    initials: String,
    age: Option[String], // TODO: Convert to enum!!
    hobbies: List[String],
    fact: String,
    role: Role
)

case class Griever(
    grieverId: Int,
    culturalBackground: Option[String],
    griefRecency: Option[String], // TODO: ENUM!
    whoLost: Option[String],
    onboardingTime: LocalDateTime
)

case class Facilitator(
    facilitatorId: Int,
    logistics: String
)

case class GroupParticipants(
    groupId: Int,
    participantId: Int
)

case class GroupMessage(
    participantId: Int,
    groupId: Int,
    body: String,
    createdAt: LocalDateTime
)

case class FacilitatorMessage(
    fromId: Int,
    toId: Int,
    groupId: Int,
    body: String,
    createdAt: LocalDateTime
)

case class CreateFacilitatorMessage(
    fromId: Int,
    toId: Int,
    body: String
)

// TODO: What is this doing?
case class CreateGroupMessage(
    participantId: Int,
    body: String
)

/* A participant's quiet-space reflection: guided answers (privateNote +
   facilitatorNote) and free writing. The two sections can be shared with the
   facilitator independently, so the facilitator only ever sees shared sections.
   TODO(next week): facilitator-side view that reads the shared_* sections. */
case class Reflection(
    id: Int,
    groupId: Int,
    participantId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    freeWriting: Option[String],
    sharedGuided: Boolean,
    sharedGuidedAt: Option[LocalDateTime],
    sharedFreeWriting: Boolean,
    sharedFreeWritingAt: Option[LocalDateTime],
    createdAt: LocalDateTime
)

case class CreateReflection(
    participantId: Int,
    privateNote: Option[String],
    facilitatorNote: Option[String],
    freeWriting: Option[String],
    shareGuided: Boolean,
    shareFreeWriting: Boolean
)

// Facilitator-curated resource link. A null groupId means it is shown to all.
case class SupportLink(
    id: Int,
    groupId: Option[Int],
    title: String,
    url: String,
    description: Option[String],
    sortOrder: Int,
    isActive: Boolean,
    createdAt: LocalDateTime,
    updatedAt: LocalDateTime
)

// A participant's private doodle (PNG stored as a base64 data URL).
case class UserDoodle(
    id: Int,
    participantId: Int,
    groupId: Int,
    imageData: String,
    sharedWithFacilitator: Boolean,
    createdAt: LocalDateTime,
    updatedAt: LocalDateTime
)

case class CreateDoodle(
    participantId: Int,
    imageData: String,
    sharedWithFacilitator: Boolean
)

// Facilitator-curated meditation playlist. A null groupId means it is shown to all.
case class MeditationPlaylist(
    id: Int,
    groupId: Option[Int],
    title: String,
    description: Option[String],
    spotifyUrl: String,
    trackCount: Option[Int],
    sortOrder: Int,
    isActive: Boolean,
    createdAt: LocalDateTime,
    updatedAt: LocalDateTime
)

case class UpdateOnboarding(
    callName: String,
    pronouns: Option[String],
    age: Option[String],
    fact: String,
    hobbies: List[String],
    culturalBackground: Option[String],
    griefRecency: Option[String],
    whoLost: Option[String]
)

// Facilitator creates / edits a group. dayOfWeek is a full upper-case name
// ("FRIDAY"); scheduledTime is an ISO local time ("20:00").

case class JsonCreateGroup(
    name: String,
    dayOfWeek: String,
    scheduledTime: String,
    scheduledDurationMinutes: Int,
    description: Option[String]
)

case class CreateGroup(
    name: String,
    dayOfWeek: String,
    scheduledTime: String,
    scheduledDurationMinutes: Int,
    creationTime: LocalDateTime,
    description: Option[String]
)

case class UpdateGroup(
    name: String,
    dayOfWeek: String,
    scheduledTime: String,
    scheduledDurationMinutes: Int,
    description: Option[String]
)

// Facilitator places a person into a group (a gentle invite, here applied directly).
case class PlaceParticipant(
    participantId: Int
)

// Facilitator saves free-form notes about a group (per-group, only they see these).
case class UpdateGroupNotes(
    notes: String
)

case class UpdateNotePrompts(
    creationReason: String,
    safeguardingConcerns: String
)

case class FacilitatorNotes(
    groupId: Int,
    notes: String,
    updatedAt: LocalDateTime,
    creationReason: String,
    safeguardingConcerns: String
)

enum Weather(val text: String) {
  case ClearSkies extends Weather("clear skies")
  case SomeSun extends Weather("some sun")
  case Overcast extends Weather("overcast")
  case Rain extends Weather("rain")
  case Stormy extends Weather("stormy")
  case Fog extends Weather("fog")
}

object Weather {
  extension (s: String) {
    def fromString(): Weather = s match {
      case "clear skies" => ClearSkies
      case "some sun"    => SomeSun
      case "overcast"    => Overcast
      case "rain"        => Rain
      case "stormy"      => Stormy
      case "fog"         => Fog
    }
  }
}

case class CreateGrieverDashboardReflection(
    choice: Weather,
    description: Option[String]
)

case class GrieverDashboardReflection(
    grieverId: Int,
    choice: Weather,
    description: Option[String],
    time: LocalDateTime
)
