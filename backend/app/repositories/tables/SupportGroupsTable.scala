package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*
import repositories.Instances.given

import java.time.{LocalTime, LocalDateTime, DayOfWeek}

class SupportGroupsTable(tag: Tag)
    extends Table[SupportGroup](tag, "support_groups") {
  def groupId = column[Int]("group_id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def day = column[DayOfWeek]("day_of_week")
  def time = column[LocalTime]("time")
  def duration = column[Int]("duration")
  def creationTime = column[LocalDateTime]("time_of_creation")
  def description = column[Option[String]]("description")
  def hasSessionNow = column[Boolean]("has_session_now")
  def lastSessionEndedAt =
    column[Option[LocalDateTime]]("last_ended_at")

  def * = (
    groupId,
    name,
    day,
    time,
    duration,
    creationTime,
    description,
    hasSessionNow,
    lastSessionEndedAt
  )
    .mapTo[SupportGroup]
}
