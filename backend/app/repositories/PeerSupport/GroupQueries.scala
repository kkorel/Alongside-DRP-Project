package repositories.PeerSupport

import slick.jdbc.PostgresProfile.api.*
import slick.sql.FixedSqlAction
import models.*
import repositories.Instances.given

import java.time.{DayOfWeek, LocalDateTime, LocalTime}
import play.api.http.MediaRange.parse
import repositories.tables.{
  SupportGroupsTable,
  GroupParticipantsTable,
  ParticipantsTable,
  GrieversTable
}

class GroupQueries(
    private val groups: TableQuery[SupportGroupsTable],
    private val groupParticipants: TableQuery[GroupParticipantsTable],
    private val participants: TableQuery[ParticipantsTable]
) {
  // Cultural background lives on the griever row, joined in below. Left-joined so
  // members without one (e.g. the facilitator) are still returned.
  private val grievers = TableQuery[GrieversTable]

  /* Returns the group name, facilitator name, conversation duration, day and
   * time given groupId. */
  def selectGroup(groupId: Int): Query[
    (
        Rep[String],
        Rep[String],
        Rep[Int],
        Rep[DayOfWeek],
        Rep[LocalTime],
        Rep[Option[String]]
    ),
    (String, String, Int, DayOfWeek, LocalTime, Option[String]),
    Seq
  ] = {
    for
      g <- groups if g.groupId === groupId
      gp <- groupParticipants if gp.groupId === g.groupId
      p <- participants
      if gp.participantId === p.participantId && p.role === Role.FACILITATOR
    yield (g.name, p.name, g.duration, g.day, g.time, g.description)
  }

  /* Selects the participant ID of the group facilitator. */
  def selectFacilitator(groupId: Int): Query[(Rep[Int]), Int, Seq] = {
    for
      gp <- groupParticipants if gp.groupId === groupId
      p <- participants if p.role === Role.FACILITATOR
    yield p.participantId
  }

  /* Returns all of the participants in a group and their (visible) information. */
  def selectParticipants(groupId: Int): Query[
    (
        Rep[Int],
        Rep[String],
        Rep[Option[String]],
        Rep[String],
        Rep[Option[String]],
        Rep[List[String]],
        Rep[String],
        Rep[Role],
        Rep[Option[Option[String]]]
    ),
    (
        Int,
        String,
        Option[String],
        String,
        Option[String],
        List[String],
        String,
        Role,
        Option[Option[String]]
    ),
    Seq
  ] = {
    val ps = for
      gp <- groupParticipants if gp.groupId === groupId
      p <- participants if gp.participantId === p.participantId
    yield p
    ps.joinLeft(grievers)
      .on(_.participantId === _.grieverId)
      .map { case (p, g) =>
        (
          p.participantId,
          p.name,
          p.pronouns,
          p.initials,
          p.age,
          p.hobbies,
          p.fact,
          p.role,
          g.map(_.culturalBackground)
        )
      }
      .sortBy(p => (p._8.desc, p._2.asc))
  }

  /* Returns the list of all groups that the given user is in. */
  def selectAllGroupsUserIsIn(
      participantId: Int
  ): Query[(Rep[Int]), Int, Seq] = {
    // TODO: Is some ordering required?
    for gp <- groupParticipants if gp.participantId === participantId
    yield gp.groupId
  }

  /* Returns the day, time and duration of the group conversations. */
  def selectTimeOfGroup(groupId: Int): Query[
    (Rep[DayOfWeek], Rep[LocalTime], Rep[Int]),
    (DayOfWeek, LocalTime, Int),
    Seq
  ] = {
    for g <- groups if g.groupId === groupId
    yield (g.day, g.time, g.duration)
  }

  /* Returns the information about a participant given the participantId. */
  def selectParticipantInfo(participantId: Int): Query[
    (
        Rep[Int],
        Rep[String],
        Rep[Option[String]],
        Rep[String],
        Rep[Option[String]],
        Rep[List[String]],
        Rep[String],
        Rep[Role],
        Rep[Option[Option[String]]]
    ),
    (
        Int,
        String,
        Option[String],
        String,
        Option[String],
        List[String],
        String,
        Role,
        Option[Option[String]]
    ),
    Seq
  ] = {
    participants
      .filter(_.participantId === participantId)
      .joinLeft(grievers)
      .on(_.participantId === _.grieverId)
      .map { case (p, g) =>
        (
          p.participantId,
          p.name,
          p.pronouns,
          p.initials,
          p.age,
          p.hobbies,
          p.fact,
          p.role,
          g.map(_.culturalBackground)
        )
      }
  }

  /* Every participant in the database (any role), with their cultural background
   * left-joined in. Used by the control panel to list everyone you can become. */
  def selectAllParticipantInfo = {
    participants
      .joinLeft(grievers)
      .on(_.participantId === _.grieverId)
      .map { case (p, g) =>
        (
          p.participantId,
          p.name,
          p.pronouns,
          p.initials,
          p.age,
          p.hobbies,
          p.fact,
          p.role,
          g.map(_.culturalBackground)
        )
      }
      .sortBy(_._2.asc)
  }

  /* The current session flag together with the schedule (day, time, duration)
   * and the last close time, so callers can work out whether this week's
   * session already ran and whether its scheduled end has passed. */
  def selectSessionState(groupId: Int): Query[
    (
        Rep[Boolean],
        Rep[DayOfWeek],
        Rep[LocalTime],
        Rep[Int],
        Rep[Option[LocalDateTime]]
    ),
    (Boolean, DayOfWeek, LocalTime, Int, Option[LocalDateTime]),
    Seq
  ] =
    for g <- groups if g.groupId === groupId
    yield (g.hasSessionNow, g.day, g.time, g.duration, g.lastSessionEndedAt)

  def startSession(
      groupId: Int
  ): FixedSqlAction[Int, slick.dbio.NoStream, slick.dbio.Effect.Write] =
    groups.filter(_.groupId === groupId).map(_.hasSessionNow).update(true)

  /* Ending a session also records when, which is what locks the room until
   * the next scheduled week. */
  def endSession(
      groupId: Int,
      endedAt: LocalDateTime
  ): FixedSqlAction[Int, slick.dbio.NoStream, slick.dbio.Effect.Write] =
    groups
      .filter(_.groupId === groupId)
      .map(g => (g.hasSessionNow, g.lastSessionEndedAt))
      .update((false, Some(endedAt)))
}
