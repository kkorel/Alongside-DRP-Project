package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class UserDoodlesTable(tag: Tag)
    extends Table[UserDoodle](tag, "user_doodles") {
  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  def participantId = column[Int]("participant_id")
  def groupId = column[Int]("group_id")
  def imageData = column[String]("image_data")
  def sharedWithFacilitator = column[Boolean]("shared_with_facilitator")
  def createdAt = column[LocalDateTime]("created_at")
  def updatedAt = column[LocalDateTime]("updated_at")

  def * =
    (
      id,
      participantId,
      groupId,
      imageData,
      sharedWithFacilitator,
      createdAt,
      updatedAt
    ).mapTo[UserDoodle]
}
