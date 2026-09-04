package controllers

import models.*
import models.JsonFormats.given
import play.api.mvc.*
import play.api.libs.json.*
import repositories.QuietRoom.QuietRoomRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class QuietRoomController @Inject() (
    cc: ControllerComponents,
    quietRoomRepository: QuietRoomRepository,
    executionContext: ExecutionContext
) extends Controller(cc, executionContext) {
  def latestReflection(
      groupId: Int,
      participantId: Int
  ): Action[AnyContent] =
    quietRoomRepository.latestReflection(groupId, participantId).returnOk()

  // TODO: Factor out with parent function.
  def supportLinks(groupId: Int): Action[AnyContent] =
    if (groupId <= 0)
      Action(BadRequest(Json.obj("error" -> "Invalid room")))
    else
      quietRoomRepository.activeLinksForGroup(groupId).returnOk()

  // TODO: Factor out with parent function.
  def meditationPlaylists(groupId: Int): Action[AnyContent] =
    if (groupId <= 0)
      Action(BadRequest(Json.obj("error" -> "Invalid room")))
    else
      quietRoomRepository.activeMeditationPlaylists(groupId).returnOk()

  def createReflection(groupId: Int): Action[JsValue] = createNew(
    quietRoomRepository.createReflection(groupId, _),
    (r: CreateReflection) => hasReflectionText(r)
  )

  private def hasReflectionText(reflection: CreateReflection): Boolean =
    reflection.privateNote.exists(_.trim.nonEmpty) ||
      reflection.facilitatorNote.exists(_.trim.nonEmpty) ||
      reflection.facilitatorNote.exists(_.trim.nonEmpty) ||
      reflection.freeWriting.exists(_.trim.nonEmpty)

  def saveDoodle(groupId: Int): Action[JsValue] = createNew(
    quietRoomRepository.saveDoodle(groupId, _),
    (d: CreateDoodle) => isValidDoodle(d)
  )

  // Reject empty or oversized payloads gracefully. PNG data URLs are large, so we
  // cap the stored size rather than accept an unbounded blob.
  private val MaxDoodleDataLength = 3_000_000
  private def isValidDoodle(doodle: CreateDoodle): Boolean =
    doodle.participantId > 0 &&
      doodle.imageData.startsWith("data:image/png;base64,") &&
      doodle.imageData.length <= MaxDoodleDataLength

  // TODO: Use whatever parent function is necessary.
  def doodles(groupId: Int, participantId: Int): Action[AnyContent] =
    if (groupId <= 0 || participantId <= 0)
      Action(BadRequest(Json.obj("error" -> "Invalid room or participant")))
    else
      quietRoomRepository
        .doodlesForParticipant(groupId, participantId)
        .returnOk()
}
