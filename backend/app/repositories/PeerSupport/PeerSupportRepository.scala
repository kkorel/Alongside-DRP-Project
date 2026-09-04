package repositories.PeerSupport // TODO: Should this be in the parent package?

import config.DatabaseConfig
import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.*
import repositories.Repository

@Singleton
class PeerSupportRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private val supportGroups = TableQuery[SupportGroupsTable]
  private val participants = TableQuery[ParticipantsTable]
  private val groupParticipants = TableQuery[GroupParticipantsTable]
  private val groupMessages = TableQuery[GroupMessagesTable]

  private val groupQuerier =
    GroupQueries(supportGroups, groupParticipants, participants)
  private val groupMessageQuerier = GroupMessageQueries(groupMessages)

  def findGroup(groupId: Int): Future[ReturnSupportGroup] =
    db.run(groupQuerier.selectGroup(groupId).result.head)
      .map { case (name, facilitatorName, duration, day, time, description) =>
        // Day and time live in the DB; expose them as plain strings so the
        // existing Json.writes macro can serialise them without a LocalTime
        // writer (e.g. "FRIDAY", "17:00").
        ReturnSupportGroup(
          name,
          facilitatorName,
          duration,
          day.name(),
          time.toString,
          description
        )
      }

  // The left join yields cultural background as a nested Option (Option-from-join
  // of an already-optional column), so flatten it before building the response.
  private def toReturnParticipant(
      row: (
          Int,
          String,
          Option[String],
          String,
          Option[String],
          List[String],
          String,
          Role,
          Option[Option[String]]
      )
  ): ReturnParticipant =
    ReturnParticipant(
      row._1,
      row._2,
      row._3,
      row._4,
      row._5,
      row._6,
      row._7,
      row._8,
      row._9.flatten
    )

  def participantsForGroup(
      groupId: Int
  ): Future[Seq[ReturnParticipant]] =
    db.run(groupQuerier.selectParticipants(groupId).result)
      .map(_.map(toReturnParticipant))

  def participantInfo(
      participantId: Int
  ): Future[Seq[ReturnParticipant]] =
    db.run(groupQuerier.selectParticipantInfo(participantId).result)
      .map(_.map(toReturnParticipant))

  /* Everyone in the database, split by role for the control panel. */
  def allPeople(): Future[ReturnPeople] =
    db.run(groupQuerier.selectAllParticipantInfo.result)
      .map(_.map(toReturnParticipant))
      .map { all =>
        val (facilitators, participants) =
          all.partition(_.role == Role.FACILITATOR)
        ReturnPeople(participants, facilitators)
      }

  def groupMessages(groupId: Int): Future[Seq[ReturnGroupMessage]] =
    db.run(groupMessageQuerier.selectMessagesFromParticipant(groupId).result)
      .map(_.map(ReturnGroupMessage.apply))

  def sendGroupMessage(
      groupId: Int,
      message: CreateGroupMessage
  ): Future[Seq[ReturnGroupMessage]] = {
    val query = groupMessageQuerier.insertNewMessage(
      GroupMessage(
        message.participantId,
        groupId,
        message.body,
        getCurrentTime()
      )
    )
    db.run(query)
    groupMessages(groupId) // TODO: Get rid
  }

  def isValidSessionNow(groupId: Int): Future[ReturnIsSessionNow] = {
    val query = groupQuerier.selectSessionState(groupId)
    db.run(query.result.head).map {
      case (isNow, day, time, duration, lastEnded) =>
        val now = getCurrentTime()
        // Joinable only while the facilitator has the room open AND the meeting's
        // scheduled end hasn't passed — the clock auto-closes a room the
        // facilitator forgot to end, instead of leaving it open indefinitely.
        ReturnIsSessionNow(
          isNow && !SessionWeek.pastScheduledEnd(day, time, duration, now),
          SessionWeek.closedForWeek(day, lastEnded, now)
        )
    }
  }

  /* The room can only be opened if this week's session hasn't already been
     held — otherwise we refuse, so a session can't be reopened until the next
     scheduled week. */
  def startSession(groupId: Int): Future[Either[String, Int]] = {
    val now = getCurrentTime()
    val action = groupQuerier
      .selectSessionState(groupId)
      .result
      .headOption
      .flatMap {
        case Some((_, day, _, _, lastEnded))
            if !SessionWeek.closedForWeek(day, lastEnded, now) =>
          groupQuerier.startSession(groupId).map(Right(_))
        case Some(_) => DBIO.successful(Left("sessionClosedForWeek"))
        case None    => DBIO.successful(Left("groupNotFound"))
      }
    db.run(action.transactionally)
  }

  def endSession(groupId: Int): Future[Int] =
    db.run(groupQuerier.endSession(groupId, getCurrentTime()))
}
