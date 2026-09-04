package controllers

import models.*
import models.JsonFormats.given
import play.api.libs.json.*
import play.api.mvc.*
import repositories.Dashboard.DashboardRepository

import javax.inject.*
import scala.concurrent.ExecutionContext

/* The facilitator's side of the app: the groups they hold, the people waiting to be
   placed, a full read of any person, placing someone into a group, creating / editing
   a group, and the room's private-messages-and-reflections rail. Reads wrap in 200 OK;
   writes validate then return 201 via the shared `createNew` helper. */
@Singleton
class DashboardController @Inject() (
    cc: ControllerComponents,
    dashboardRepository: DashboardRepository,
    executionContext: ExecutionContext
) extends Controller(cc, executionContext) {
  def saveIcebreaker(participantId: Int): Action[JsValue] = createNew(
    dashboardRepository.saveIcebreaker(participantId, _),
    _ => true
  )

  def getIcebreakers(participantId: Int): Action[AnyContent] =
    dashboardRepository.getIcebreakers(participantId).returnOk()
}
