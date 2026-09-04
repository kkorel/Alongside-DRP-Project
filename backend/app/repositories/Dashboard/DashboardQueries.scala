package repositories.Dashboard

import models.*
import java.time.LocalDateTime
import slick.jdbc.PostgresProfile.api.*
import slick.sql.FixedSqlAction

import repositories.tables.GrieversDashboardReflectionsTable
import repositories.Instances.given

class DashboardQueries(
    private val reflectionsTable: TableQuery[GrieversDashboardReflectionsTable]
) {
  def insertIcebreaker(
      participantId: Int,
      reflection: CreateGrieverDashboardReflection,
      currentTime: LocalDateTime
  ) = {
    reflectionsTable += GrieverDashboardReflection(
      participantId,
      reflection.choice,
      reflection.description,
      currentTime
    )
  }

  def selectIcebreakers(participantId: Int): Query[
    (Rep[Weather], Rep[Option[String]], Rep[LocalDateTime]),
    (Weather, Option[String], LocalDateTime),
    Seq
  ] = {
    for r <- reflectionsTable if r.grieverId === participantId
    yield (r.choice, r.description, r.reflectionTime)
  }
}
