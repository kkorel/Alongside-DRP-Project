package repositories.Dashboard

import config.DatabaseConfig
import models.*
import slick.jdbc.PostgresProfile.api.*

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.GrieversDashboardReflectionsTable
import repositories.Repository

@Singleton
class DashboardRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private val reflectionsTable = TableQuery[GrieversDashboardReflectionsTable]
  private val dashboardQuerier = DashboardQueries(reflectionsTable)

  def saveIcebreaker(
      participantId: Int,
      reflection: CreateGrieverDashboardReflection
  ): Future[Int] =
    db.run(
      dashboardQuerier.insertIcebreaker(
        participantId,
        reflection,
        getCurrentTime()
      )
    )

  def getIcebreakers(participantId: Int): Future[Seq[ReturnIcebreakers]] =
    db.run(
      dashboardQuerier.selectIcebreakers(participantId).sortBy(_._3.desc).result
    ).map(_.map(ReturnIcebreakers.apply))
}
