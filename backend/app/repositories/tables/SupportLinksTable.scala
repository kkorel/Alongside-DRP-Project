package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class SupportLinksTable(tag: Tag)
    extends Table[SupportLink](tag, "support_links") {
  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  def groupId = column[Option[Int]]("group_id")
  def title = column[String]("title")
  def url = column[String]("url")
  def description = column[Option[String]]("description")
  def sortOrder = column[Int]("sort_order")
  def isActive = column[Boolean]("is_active")
  def createdAt = column[LocalDateTime]("created_at")
  def updatedAt = column[LocalDateTime]("updated_at")

  def * =
    (
      id,
      groupId,
      title,
      url,
      description,
      sortOrder,
      isActive,
      createdAt,
      updatedAt
    ).mapTo[SupportLink]
}
