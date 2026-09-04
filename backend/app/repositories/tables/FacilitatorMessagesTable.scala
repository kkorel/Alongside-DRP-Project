package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

// TODO: Factor out with GroupMessagesTable.
class FacilitatorMessagesTable(tag: Tag)
    extends Table[FacilitatorMessage](tag, "facilitator_messages") {
  def fromId = column[Int]("from_id", O.PrimaryKey)
  def toId = column[Int]("to_id", O.PrimaryKey)
  def groupId = column[Int]("group_id", O.PrimaryKey)
  def body = column[String]("body")
  def createdAt = column[LocalDateTime]("created_at", O.PrimaryKey)

  def * = (fromId, toId, groupId, body, createdAt).mapTo[FacilitatorMessage]
}
