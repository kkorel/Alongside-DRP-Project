package repositories.tables

import slick.jdbc.PostgresProfile.api.*
import models.FacilitatorNotes
import java.time.LocalDateTime

class FacilitatorGroupNotesTable(tag: Tag)
    extends Table[FacilitatorNotes](
      tag,
      "facilitator_group_notes"
    ) {
  def groupId = column[Int]("group_id", O.PrimaryKey)
  def notes = column[String]("notes")
  def updatedAt = column[LocalDateTime]("updated_at")
  def creationReason = column[String]("reason_for_putting_people_together")
  def safeguardingConcerns = column[String]("known_safeguarding_concerns")

  def * = (groupId, notes, updatedAt, creationReason, safeguardingConcerns)
    .mapTo[FacilitatorNotes]
}
