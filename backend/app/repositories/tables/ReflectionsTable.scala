package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class ReflectionsTable(tag: Tag) extends Table[Reflection](tag, "reflections") {
  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  def groupId = column[Int]("group_id")
  def participantId = column[Int]("participant_id")
  def privateNote = column[Option[String]]("private_note")
  def facilitatorNote = column[Option[String]]("facilitator_note")
  def freeWriting = column[Option[String]]("free_writing")
  def sharedGuided = column[Boolean]("shared_guided")
  def sharedGuidedAt = column[Option[LocalDateTime]]("shared_guided_at")
  def sharedFreeWriting = column[Boolean]("shared_free_writing")
  def sharedFreeWritingAt =
    column[Option[LocalDateTime]]("shared_free_writing_at")
  def createdAt = column[LocalDateTime]("created_at")

  def * =
    (
      id,
      groupId,
      participantId,
      privateNote,
      facilitatorNote,
      freeWriting,
      sharedGuided,
      sharedGuidedAt,
      sharedFreeWriting,
      sharedFreeWritingAt,
      createdAt
    ).mapTo[Reflection]
}
