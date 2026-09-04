package repositories.FacilitatorSupport

import config.DatabaseConfig
import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.FacilitatorMessagesTable
import repositories.Repository

@Singleton
class FacilitatorSupportRepository @Inject() (
    executionContext: ExecutionContext
) extends Repository(executionContext) {
  private val facilitatorMessages = TableQuery[FacilitatorMessagesTable]
  private val facilitatorMessageQuerier = FacilitatorMessageQueries(
    facilitatorMessages
  )

  def facilitatorMessages(
      groupId: Int,
      participantId: Int
  ): Future[Seq[ReturnFacilitatorMessage]] =
    db.run(
      facilitatorMessageQuerier
        .selectPrivateMessages(groupId, participantId)
        .result
    ).map(_.map(ReturnFacilitatorMessage.apply))

  def sendFacilitatorMessage(
      groupId: Int,
      message: CreateFacilitatorMessage
  ): Future[Int] = {
    val query = facilitatorMessageQuerier.insertNewMessage(
      FacilitatorMessage(
        message.fromId,
        message.toId,
        groupId,
        message.body,
        getCurrentTime()
      )
    )
    db.run(query)
  }
}
