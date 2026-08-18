package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*
import repositories.Instances.given

import java.time.LocalDateTime

class ParticipantsTable(tag: Tag)
    extends Table[Participant](tag, "participants") {

  def participantId = column[Int]("participant_id", O.PrimaryKey, O.AutoInc)
  def name = column[String]("name")
  def pronouns = column[Option[String]]("pronouns")
  def initials = column[String]("initials")
  def age = column[Option[String]]("age")
  def hobbies = column[List[String]]("hobbies")
  def fact = column[String]("fun_fact")
  def role = column[Role]("role")

  def * = (
    participantId,
    name,
    pronouns,
    initials,
    age,
    hobbies,
    fact,
    role
  )
    .mapTo[Participant]
}
