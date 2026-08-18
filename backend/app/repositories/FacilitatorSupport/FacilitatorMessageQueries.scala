package repositories.FacilitatorSupport

import java.time.LocalDateTime
import models.FacilitatorMessage
import slick.jdbc.PostgresProfile.api.*
import slick.sql.FixedSqlAction

import repositories.tables.FacilitatorMessagesTable

// TODO: Factor out with GroupMessageQueries.
class FacilitatorMessageQueries(
    private val messagesTable: TableQuery[FacilitatorMessagesTable]
) {
  /* Returns the (participantId, the message body, and the time of the message) for all messages
     sent in the group conversation. */
  def selectPrivateMessages(groupId: Int, participantId: Int): Query[
    (Rep[Int], Rep[Int], Rep[String], Rep[LocalDateTime]),
    (Int, Int, String, LocalDateTime),
    Seq
  ] = {
    val messages = for
      m <- messagesTable
      if m.groupId === groupId && (m.fromId === participantId || m.toId === participantId)
    yield (m.fromId, m.toId, m.body, m.createdAt)
    messages.sortBy(m => m._4.asc)
  }

  def insertNewMessage(
      message: FacilitatorMessage
  ): FixedSqlAction[Int, slick.dbio.NoStream, slick.dbio.Effect.Write] = {
    messagesTable += message
  }
}
