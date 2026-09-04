package controllers

import models.CreateSupportRequest
import models.JsonFormats.given
import play.api.libs.json.*
import play.api.mvc.*
import repositories.SupportRequestRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

/* TODO: We can probably factor this out with `PeerSupportController` via the Template pattern,
   but this requires knowing what this code is even used for first. */
@Singleton
class SupportRequestController @Inject() (
    cc: ControllerComponents,
    supportRequestRepository: SupportRequestRepository,
    executionContext: ExecutionContext
) extends AbstractController(cc) {
  private given ExecutionContext = executionContext

  def index: Action[AnyContent] = Action.async {
    supportRequestRepository.all().map { requests =>
      Ok(Json.toJson(requests))
    }
  }

  def create: Action[JsValue] = Action.async(parse.json) { request =>
    request.body.validate[CreateSupportRequest] match {
      case JsSuccess(createSupportRequest, _) =>
        supportRequestRepository.create(createSupportRequest).map {
          savedRequest =>
            Created(Json.toJson(savedRequest))
        }

      case JsError(errors) =>
        Future.successful(
          BadRequest(Json.obj("error" -> JsError.toJson(errors)))
        )
    }
  }
}
