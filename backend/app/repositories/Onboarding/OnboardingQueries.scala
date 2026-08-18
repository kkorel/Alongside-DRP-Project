package repositories.Onboarding

import slick.sql.FixedSqlAction
import slick.jdbc.PostgresProfile.api.*
import models.*
import repositories.Instances.given

import repositories.tables.{GrieversTable, ParticipantsTable}
import java.time.LocalDateTime
import scala.concurrent.ExecutionContext

// TODO: What is the difference between fun fact and hobbies?
class OnboardingQueries(
    private val grieversTable: TableQuery[GrieversTable],
    private val participantsTable: TableQuery[ParticipantsTable]
)(using ExecutionContext) {
  def selectAllOnboardingInformation(participantId: Int) = {
    for
      g <- grieversTable if g.grieverId === participantId
      p <- participantsTable if p.participantId === g.grieverId
    yield (
      g.grieverId,
      p.name,
      p.pronouns,
      p.age,
      p.fact,
      p.hobbies,
      g.culturalBackground,
      g.griefRecency,
      g.whoLost
    )
  }

  def insertNewOnboardingInformation(
      participantId: Int,
      update: UpdateOnboarding,
      markComplete: Boolean,
      now: LocalDateTime
  ) = {

    val participantUpdate =
      participantsTable
        .filter(_.participantId === participantId)
        .map(p =>
          (
            p.name,
            p.pronouns,
            p.age,
            p.fact,
            p.hobbies
          )
        )
        .update(
          (
            update.callName,
            update.pronouns,
            update.age,
            update.fact,
            update.hobbies
          )
        )

    val grieverUpdate =
      grieversTable
        .filter(_.grieverId === participantId)
        .map(g =>
          (
            g.culturalBackground,
            g.griefRecency,
            g.whoLost
          )
        )
        .update(
          (
            update.culturalBackground,
            update.griefRecency,
            update.whoLost
          )
        )

    // Only a genuine completion of the onboarding flow refreshes the timestamp;
    // a profile edit leaves the original onboarding time untouched.
    val timeUpdate =
      if markComplete then
        grieversTable
          .filter(_.grieverId === participantId)
          .map(_.onboardingTime)
          .update(now)
      else DBIO.successful(0)

    (for {
      p <- participantUpdate
      g <- grieverUpdate
      _ <- timeUpdate
    } yield p + g).transactionally
  }
}
