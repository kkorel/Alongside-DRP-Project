package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

class FacilitatorsTable(tag: Tag)
    extends Table[Facilitator](tag, "facilitators") {

  def facilitatorId = column[Int]("facilitator_id", O.PrimaryKey)
  def logistics = column[String]("logistics")

  def * = (
    facilitatorId,
    logistics
  )
    .mapTo[Facilitator]
}
