package repositories

import config.DatabaseConfig
import models.{CreateSupportRequest, SupportRequest}
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import javax.inject._
import scala.concurrent.{ExecutionContext, Future}
import repositories.Repository

// TODO: Is any of this used anywhere?
@Singleton
class SupportRequestRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private class SupportRequestsTable(tag: Tag)
      extends Table[SupportRequest](tag, "support_requests") {

    def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
    def name = column[String]("name")
    def email = column[String]("email")
    def supportType = column[String]("support_type")
    def message = column[String]("message")
    def status = column[String]("status")
    def createdAt = column[LocalDateTime]("created_at")

    def * =
      (id, name, email, supportType, message, status, createdAt) <> (
        { case (id, name, email, supportType, message, status, createdAt) =>
          SupportRequest(
            id,
            name,
            email,
            supportType,
            message,
            status,
            createdAt
          )
        },
        SupportRequest.unapply
      )
  }

  private val supportRequests = TableQuery[SupportRequestsTable]

  def all(): Future[Seq[SupportRequest]] = {
    db.run(supportRequests.sortBy(_.createdAt.desc).result)
  }

  def create(request: CreateSupportRequest): Future[SupportRequest] = {
    val insertQuery =
      (supportRequests returning supportRequests.map(_.id)) += SupportRequest(
        id = 0,
        name = request.name,
        email = request.email,
        supportType = request.supportType,
        message = request.message,
        status = "open",
        createdAt = getCurrentTime()
      )

    db.run(insertQuery).flatMap { newId =>
      db.run(supportRequests.filter(_.id === newId).result.head)
    }
  }
}
