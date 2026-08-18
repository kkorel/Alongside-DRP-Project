package controllers

import models.*
import models.JsonFormats.given
import play.api.libs.json.*
import play.api.mvc.*
import repositories.PeerSupport.PeerSupportRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

@Singleton
abstract class Controller(
    cc: ControllerComponents,
    executionContext: ExecutionContext
) extends AbstractController(cc) {
  protected given ExecutionContext = executionContext

  extension [A](req: Future[A])
    protected def returnOk()(using Writes[A]): Action[AnyContent] =
      Action.async {
        req.map(v => Ok(Json.toJson(v)))
      }

  /* Validates the request and returns an object of JsSuccess(A, _), where A is CreateMessage or
     CreateReflection.  If this inner A is well-formed, we then map it into the actual GroupMessage
     or Reflection, convert it to JSON and return the object.  In the event of an error, we return
     a generic error message because the frontend will handle it as needed. */
  protected def createNew[A, B](
      create: A => Future[B],
      successCond: A => Boolean
  )(using Reads[A], Writes[B]): Action[JsValue] = Action.async(parse.json) {
    req =>
      req.body.validate[A] match {
        case JsSuccess(createe, _) if successCond(createe) =>
          create(createe).map(saved => Created(Json.toJson(saved)))
        case _ =>
          Future.successful(BadRequest(Json.obj("error" -> "Message failed")))
      }
  }
}
