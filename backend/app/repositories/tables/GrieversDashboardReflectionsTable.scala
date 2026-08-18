package repositories.tables

import models.*
import java.time.LocalDateTime
import repositories.Instances.given
import slick.jdbc.PostgresProfile.api.*

class GrieversDashboardReflectionsTable(tag: Tag)
    extends Table[GrieverDashboardReflection](tag, "dashboard_reflections") {
  def grieverId = column[Int]("griever_id", O.PrimaryKey)
  def choice = column[Weather]("choice")
  def description = column[Option[String]]("description")
  def reflectionTime = column[LocalDateTime]("reflection_time")

  def * = (grieverId, choice, description, reflectionTime)
    .mapTo[GrieverDashboardReflection]
}
