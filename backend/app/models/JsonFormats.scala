package models

import play.api.libs.json.*
import java.time.{LocalDateTime, DayOfWeek}
import java.time.format.DateTimeFormatter
import repositories.Instances.given
import Weather.fromString

object JsonFormats {
  given localDateTimeWrites: Writes[LocalDateTime] =
    Writes(time => JsString(time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)))

  given roleWrites: Writes[Role] = Writes(role => JsString(role.show))

  given createSupportRequestReads: Reads[CreateSupportRequest] =
    Json.reads[CreateSupportRequest]

  given supportRequestWrites: Writes[SupportRequest] =
    Json.writes[SupportRequest]

  given dayOfWeekWrites: Writes[DayOfWeek] = Writes(day => JsString(day.name()))

  given supportGroupWrites: Writes[SupportGroup] =
    Json.writes[SupportGroup]

  given participantWrites: Writes[Participant] =
    Json.writes[Participant]

  given createGroupMessageReads: Reads[CreateGroupMessage] =
    Json.reads[CreateGroupMessage]

  given createFacilitatorMessageReads: Reads[CreateFacilitatorMessage] =
    Json.reads[CreateFacilitatorMessage]

  given groupGroupMessageWrites: Writes[GroupMessage] =
    Json.writes[GroupMessage]

  given createReflectionReads: Reads[CreateReflection] =
    Json.reads[CreateReflection]

  given createDoodleReads: Reads[CreateDoodle] =
    Json.reads[CreateDoodle]

  given reflectionWrites: Writes[Reflection] =
    Json.writes[Reflection]

  given returnSupportGroupWrites: Writes[ReturnSupportGroup] =
    Json.writes[ReturnSupportGroup]

  given returnParticipantWrites: Writes[ReturnParticipant] =
    Json.writes[ReturnParticipant]

  given returnPeopleWrites: Writes[ReturnPeople] =
    Json.writes[ReturnPeople]

  given returnGroupMessageWrites: Writes[ReturnGroupMessage] =
    Json.writes[ReturnGroupMessage]

  given returnFacilitatorMessageWrites: Writes[ReturnFacilitatorMessage] =
    Json.writes[ReturnFacilitatorMessage]

  given returnSupportLinkWrites: Writes[ReturnSupportLink] =
    Json.writes[ReturnSupportLink]

  given returnMeditationPlaylistWrites: Writes[ReturnMeditationPlaylist] =
    Json.writes[ReturnMeditationPlaylist]

  given returnDoodleWrites: Writes[ReturnDoodle] =
    Json.writes[ReturnDoodle]

  given returnReflectionResponse: Writes[ReturnReflectionResponse] =
    Json.writes[ReturnReflectionResponse]

  given updateOnboardingReads: Reads[UpdateOnboarding] =
    Json.reads[UpdateOnboarding]

  given returnOnboardingWrites: Writes[ReturnOnboarding] =
    Json.writes[ReturnOnboarding]

  // ---- facilitator-side views ----
  // Leaf writes must precede the composites that nest them.
  given returnFacilitatorMemberWrites: Writes[ReturnFacilitatorMember] =
    Json.writes[ReturnFacilitatorMember]

  given returnFacilitatorGroupWrites: Writes[ReturnFacilitatorGroup] =
    Json.writes[ReturnFacilitatorGroup]

  given returnFacilitatorParticipantWrites
      : Writes[ReturnFacilitatorParticipant] =
    Json.writes[ReturnFacilitatorParticipant]

  given returnInboxEntryWrites: Writes[ReturnInboxEntry] =
    Json.writes[ReturnInboxEntry]

  given createGroupReads: Reads[CreateGroup] = Json.reads[CreateGroup]

  given updateGroupReads: Reads[UpdateGroup] = Json.reads[UpdateGroup]

  given placeParticipantReads: Reads[PlaceParticipant] =
    Json.reads[PlaceParticipant]

  given updateGroupNotesReads: Reads[UpdateGroupNotes] =
    Json.reads[UpdateGroupNotes]

  given returnGroupNotesWrites: Writes[ReturnGroupNotes] =
    Json.writes[ReturnGroupNotes]

  given returnIsSessionNow: Writes[ReturnIsSessionNow] =
    Json.writes[ReturnIsSessionNow]

  given returnNotePrompts: Writes[ReturnNotePrompts] =
    Json.writes[ReturnNotePrompts]

  given updateNotePrompts: Reads[UpdateNotePrompts] =
    Json.reads[UpdateNotePrompts]

  given jsonCreateGroup: Reads[JsonCreateGroup] = Json.reads[JsonCreateGroup]

  import play.api.libs.json.*

  given jsonWeatherRead: Reads[Weather] = Reads {
    // TODO: REALLY UNSAFE
    case JsString(weather) => JsSuccess(weather.fromString())
    case _                 => JsError()
  }

  given jsonWeatherWrite: Writes[Weather] = Writes(w => JsString(w.text))

  given createGrieverDashboardReflection
      : Reads[CreateGrieverDashboardReflection] =
    Json.reads[CreateGrieverDashboardReflection]

  given returnIcebreakers: Writes[ReturnIcebreakers] =
    Json.writes[ReturnIcebreakers]
}
