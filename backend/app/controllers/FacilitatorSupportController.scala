package controllers

import models.*
import models.JsonFormats.given
import play.api.mvc.*
import play.api.libs.json.*
import repositories.FacilitatorSupport.FacilitatorSupportRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class FacilitatorSupportController @Inject() (
    cc: ControllerComponents,
    facilitatorSupportRepository: FacilitatorSupportRepository,
    executionContext: ExecutionContext
) extends Controller(cc, executionContext) {

  def facilitatorMessages(
      groupId: Int,
      participantId: Int
  ): Action[AnyContent] =
    facilitatorSupportRepository
      .facilitatorMessages(groupId, participantId)
      .returnOk()

  def sendFacilitatorMessage(groupId: Int): Action[JsValue] = createNew(
    facilitatorSupportRepository.sendFacilitatorMessage(groupId, _),
    (m: CreateFacilitatorMessage) => m.body.trim.nonEmpty
  )
}
