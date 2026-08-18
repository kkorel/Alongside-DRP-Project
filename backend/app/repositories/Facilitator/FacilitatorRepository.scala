package repositories.Facilitator

import models.*
import slick.jdbc.PostgresProfile.api.*
import repositories.Instances.given

import java.time.{DayOfWeek, LocalDateTime, LocalTime, ZoneId}
import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.*
import repositories.Repository

/* The facilitator's read/write surface: every group they hold (with members), the
   people who finished onboarding and are waiting to be placed, the full read of a
   person (including the carried loss), placing a person into a group, creating /
   editing a group, and the room's "privately with you" rail. */
@Singleton
class FacilitatorRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private val supportGroups = TableQuery[SupportGroupsTable]
  private val participants = TableQuery[ParticipantsTable]
  private val facilitators = TableQuery[FacilitatorsTable]
  private val grievers = TableQuery[GrieversTable]
  private val groupParticipants = TableQuery[GroupParticipantsTable]
  private val facilitatorMessages = TableQuery[FacilitatorMessagesTable]
  private val groupMessages = TableQuery[GroupMessagesTable]
  private val reflections = TableQuery[ReflectionsTable]
  private val facilitatorGroupNotes = TableQuery[FacilitatorGroupNotesTable]

  private def member(p: Participant): ReturnFacilitatorMember =
    ReturnFacilitatorMember(
      p.participantId,
      p.name,
      p.initials,
      p.pronouns,
      p.role
    )

  /* Every group, each with its member summaries. Scheduling is left as the raw
     day/time so the frontend can format "live tonight" / "next …" itself. */
  def groups(
      facilitatorId: Option[Int] = None
  ): Future[Seq[ReturnFacilitatorGroup]] =
    for {
      gs <- db.run(supportGroups.sortBy(_.groupId).result)
      gps <- db.run(groupParticipants.result)
      ps <- db.run(participants.result)
    } yield {
      val byId = ps.map(p => p.participantId -> p).toMap
      // When scoped to a facilitator, only the groups they facilitate (i.e. are a
      // FACILITATOR member of) are visible; otherwise every group is returned.
      val visibleGroupIds: Option[Set[Int]] = facilitatorId.map { fid =>
        gps
          .filter(gp =>
            gp.participantId == fid &&
              byId.get(fid).exists(_.role == Role.FACILITATOR)
          )
          .map(_.groupId)
          .toSet
      }
      gs.filter(g => visibleGroupIds.forall(_.contains(g.groupId))).map { g =>
        val members = gps
          .filter(_.groupId == g.groupId)
          .flatMap(gp => byId.get(gp.participantId))
          .map(member)
        ReturnFacilitatorGroup(
          g.groupId,
          g.name,
          g.day.name(),
          g.time.toString,
          g.duration,
          g.creationTime,
          g.description,
          members
        )
      }
    }

  /* People who have not yet been placed in any group. */
  def arrivals(): Future[Seq[ReturnFacilitatorParticipant]] = {
    val placed = groupParticipants.map(_.participantId)
    val query = for
      g <- grievers if !g.grieverId.in(placed)
      p <- participants if p.participantId === g.grieverId
    yield (
      g.grieverId,
      p.name,
      p.pronouns,
      p.age,
      p.initials,
      p.fact,
      p.hobbies,
      g.culturalBackground,
      g.griefRecency,
      g.whoLost,
      p.role,
      g.onboardingTime
    )

    db.run(query.result)
      .map(
        _.map(
          ReturnFacilitatorParticipant(
            _,
            _,
            _,
            _,
            _,
            _,
            _,
            _,
            _,
            _,
            _,
            _,
            None
          )
        )
      )
  }

  /* The full facilitator read of one person, with their group if placed. */
  def participant(
      participantId: Int
  ): Future[Option[ReturnFacilitatorParticipant]] = {
    val query = for
      g <- grievers if g.grieverId === participantId
      p <- participants if p.participantId === g.grieverId
    yield (
      g.grieverId,
      p.name,
      p.pronouns,
      p.age,
      p.initials,
      p.fact,
      p.hobbies,
      g.culturalBackground,
      g.griefRecency,
      g.whoLost,
      p.role,
      g.onboardingTime
    )

    for {
      maybe <- db.run(query.result)
      groupId <- db.run(
        groupParticipants
          .filter(_.participantId === participantId)
          .map(_.groupId)
          .result
          .headOption
      )
    } yield maybe
      .map(
        ReturnFacilitatorParticipant(
          _,
          _,
          _,
          _,
          _,
          _,
          _,
          _,
          _,
          _,
          _,
          _,
          groupId
        )
      )
      .headOption
  }

  /* Place a person into a group — idempotent (no-op if already a member). */
  def place(groupId: Int, place: PlaceParticipant): Future[Int] = {
    val already = groupParticipants.filter(gp =>
      gp.groupId === groupId && gp.participantId === place.participantId
    )
    db.run(already.exists.result).flatMap {
      case true  => Future.successful(0)
      case false =>
        db.run(
          groupParticipants += GroupParticipants(groupId, place.participantId)
        )
    }
  }

  /* Create a group. Groups are always weekly; the facilitator manages membership,
     so there is no cap. Duration defaults to a gentle hour. */
  def createGroup(
      create: JsonCreateGroup,
      facilitatorId: Option[Int] = None
  ): Future[ReturnFacilitatorGroup] = {
    val currentTime = getCurrentTime()
    val newGroup = SupportGroup(
      0,
      create.name,
      DayOfWeek.valueOf(create.dayOfWeek),
      LocalTime.parse(create.scheduledTime),
      create.scheduledDurationMinutes,
      currentTime,
      create.description,
      false,
      None
    )
    val insert =
      (supportGroups returning supportGroups.map(_.groupId)) += newGroup
    for {
      newId <- db.run(insert)
      // Place the creating facilitator into the group so the facilitator-scoped
      // groups list includes it straight away.
      members <- facilitatorId match {
        case Some(fid) =>
          for {
            _ <- db.run(groupParticipants += GroupParticipants(newId, fid))
            fac <- db.run(
              participants.filter(_.participantId === fid).result.headOption
            )
          } yield fac.map(member).toSeq
        case None => Future.successful(Seq.empty[ReturnFacilitatorMember])
      }
    } yield ReturnFacilitatorGroup(
      newId,
      create.name,
      create.dayOfWeek,
      create.scheduledTime,
      create.scheduledDurationMinutes,
      currentTime,
      create.description,
      members
    )
  }

  /* Edit a group's name, schedule, duration and blurb. Changing the settings also
     clears the once-per-week lock (last_ended_at): a fresh schedule means the next
     meeting is a new occurrence, so the facilitator can open it again. */
  def updateGroup(groupId: Int, update: UpdateGroup): Future[Int] =
    db.run(
      supportGroups
        .filter(_.groupId === groupId)
        .map(g =>
          (
            g.name,
            g.day,
            g.time,
            g.duration,
            g.description,
            g.lastSessionEndedAt
          )
        )
        .update(
          (
            update.name,
            DayOfWeek.valueOf(update.dayOfWeek),
            LocalTime.parse(update.scheduledTime),
            update.scheduledDurationMinutes,
            update.description,
            None
          )
        )
    )

  /* Facilitator's free-form notes for a group. Returns an empty string if no notes
     have been saved yet. */
  def groupNotes(groupId: Int): Future[ReturnGroupNotes] =
    db.run(
      facilitatorGroupNotes.filter(_.groupId === groupId).result.headOption
    ).map {
      case Some(fn) => ReturnGroupNotes(fn.notes, fn.updatedAt)
      case None     => ReturnGroupNotes("", getCurrentTime())
    }

  /* Upsert the facilitator's notes for a group, stamping the current time. */
  def upsertGroupNotes(
      groupId: Int,
      update: UpdateGroupNotes
  ): Future[ReturnGroupNotes] = {
    val now = getCurrentTime()
    db.run {
      facilitatorGroupNotes
        .filter(_.groupId === groupId)
        .map(g => (g.notes, g.updatedAt))
        .update((update.notes, now))
    }.map(_ => ReturnGroupNotes(update.notes, now))
  }

  /* Delete a group and all data that depends on it, in a single transaction. */
  def deleteGroup(groupId: Int): Future[Unit] = {
    val action = DBIO
      .seq(
        facilitatorGroupNotes.filter(_.groupId === groupId).delete,
        groupParticipants.filter(_.groupId === groupId).delete,
        facilitatorMessages.filter(_.groupId === groupId).delete,
        groupMessages.filter(_.groupId === groupId).delete,
        reflections.filter(_.groupId === groupId).delete,
        supportGroups.filter(_.groupId === groupId).delete
      )
      .transactionally
    db.run(action)
  }

  /* The room rail: for each member, their last private message and the parts of
     their reflection they chose to share. No read-state exists in the DB, so
     "unread" is approximated as "the last message in the thread is from them". */
  def inbox(groupId: Int): Future[Seq[ReturnInboxEntry]] =
    for {
      gps <- db.run(groupParticipants.filter(_.groupId === groupId).result)
      ps <- db.run(participants.result)
      msgs <- db.run(facilitatorMessages.filter(_.groupId === groupId).result)
      refs <- db.run(reflections.filter(_.groupId === groupId).result)
    } yield {
      val byId = ps.map(p => p.participantId -> p).toMap
      gps
        .flatMap(gp => byId.get(gp.participantId))
        .filter(_.role == Role.PARTICIPANT)
        .map { p =>
          val id = p.participantId
          val last = msgs
            .filter(m => m.fromId == id || m.toId == id)
            .sortBy(_.createdAt)
            .lastOption
          val ref = refs.find(_.participantId == id)
          ReturnInboxEntry(
            member(p),
            last.map(_.body),
            last.map(_.fromId),
            last.map(_.createdAt),
            last.exists(_.fromId == id),
            // TODO: Worst naming scheme in the history of ever.
            ref.filter(_.sharedGuided).flatMap(_.privateNote),
            ref.filter(_.sharedGuided).flatMap(_.facilitatorNote),
            ref.filter(_.sharedFreeWriting).flatMap(_.freeWriting),
            ref.filter(_.sharedGuided) match {
              case Some(r) => r.sharedGuidedAt
              case None    =>
                ref.filter(_.sharedFreeWriting).flatMap(_.sharedFreeWritingAt)
            }
          )
        }
    }

  def getNotePrompts(groupId: Int): Future[Seq[ReturnNotePrompts]] =
    db.run(
      facilitatorGroupNotes.filter(_.groupId === groupId).result
    ).map(
      _.map(n => ReturnNotePrompts(n.creationReason, n.safeguardingConcerns))
    )

  def setNotePrompts(groupId: Int, update: UpdateNotePrompts): Future[Int] =
    db.run(
      facilitatorGroupNotes
        .filter(_.groupId === groupId)
        .map(n => (n.creationReason, n.safeguardingConcerns))
        .update(update.creationReason, update.safeguardingConcerns)
    )
}
