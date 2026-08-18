package repositories.PeerSupport

import models.*
import java.time.LocalDateTime
import slick.sql.FixedSqlAction
import slick.jdbc.PostgresProfile.api.*

import repositories.tables.GroupMessagesTable

class GroupMessageQueries(
    private val messagesTable: TableQuery[GroupMessagesTable]
) {
  /* Returns the (participantId, the message body, and the time of the message) for all messages
     sent in the group conversation. */
  def selectMessagesFromParticipant(groupId: Int): Query[
    (Rep[Int], Rep[String], Rep[LocalDateTime]),
    (Int, String, LocalDateTime),
    Seq
  ] = {
    val messages = for m <- messagesTable if m.groupId === groupId
    yield (m.participantId, m.body, m.createdAt)
    messages.sortBy(m => m._3.asc)
  }

  def insertNewMessage(
      message: GroupMessage
  ): FixedSqlAction[Int, slick.dbio.NoStream, slick.dbio.Effect.Write] = {
    messagesTable += message
  }
}
