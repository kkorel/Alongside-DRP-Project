package repositories.Onboarding

import config.DatabaseConfig
import slick.jdbc.PostgresProfile.api.*

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.{GrieversTable, ParticipantsTable}
import repositories.Repository
import models.*

@Singleton
class OnboardingRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private val participants = TableQuery[ParticipantsTable]
  private val grievers = TableQuery[GrieversTable]
  private val querier = OnboardingQueries(grievers, participants)

  def onboarding(participantId: Int): Future[Option[ReturnOnboarding]] = {
    val query = querier.selectAllOnboardingInformation(participantId)
    db.run(query.result.headOption).map(_.map(ReturnOnboarding.apply))
  }

  def saveOnboarding(
      participantId: Int,
      onboardingInfo: UpdateOnboarding,
      markComplete: Boolean = false
  ): Future[Option[ReturnOnboarding]] = {
    val query = querier.insertNewOnboardingInformation(
      participantId,
      onboardingInfo,
      markComplete,
      getCurrentTime()
    )
    db.run(query).flatMap {
      case 0 => Future.successful(None)
      case _ => onboarding(participantId)
    }
  }
}
