package controllers

import models.*
import models.JsonFormats.given
import play.api.libs.json.*
import play.api.mvc.*
import repositories.PeerSupport.PeerSupportRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

/* Essentially, each one of these controller functions takes in the given groupId and executes
   the relevant code in the model.  Provided this is successful, we then wrap the result in a Http
   200 OK response. */
@Singleton
class PeerSupportController @Inject() (
    cc: ControllerComponents,
    peerSupportRepository: PeerSupportRepository,
    executionContext: ExecutionContext
) extends Controller(cc, executionContext) {

  def group(groupId: Int): Action[AnyContent] =
    peerSupportRepository.findGroup(groupId).returnOk()

  def participants(groupId: Int): Action[AnyContent] =
    peerSupportRepository.participantsForGroup(groupId).returnOk()

  def participantInfo(participantId: Int): Action[AnyContent] =
    peerSupportRepository.participantInfo(participantId).returnOk()

  def people: Action[AnyContent] =
    peerSupportRepository.allPeople().returnOk()

  def messages(groupId: Int): Action[AnyContent] =
    peerSupportRepository.groupMessages(groupId).returnOk()

  def sendGroupMessage(groupId: Int): Action[JsValue] = createNew(
    peerSupportRepository.sendGroupMessage(groupId, _),
    (m: CreateGroupMessage) => m.body.trim.nonEmpty
  )

  def isValidSessionNow(groupId: Int): Action[AnyContent] =
    peerSupportRepository.isValidSessionNow(groupId).returnOk()

  /* Opening the room is refused (409) once this week's session has already
     been held, so it can't be reopened until the next scheduled week. */
  def startSession(groupId: Int): Action[AnyContent] = Action.async {
    peerSupportRepository.startSession(groupId).map {
      case Right(updated) => Ok(Json.toJson(updated))
      case Left(reason)   => Conflict(Json.obj("error" -> reason))
    }
  }

  def endSession(groupId: Int): Action[AnyContent] =
    peerSupportRepository.endSession(groupId).returnOk()
}
