package controllers

import models.*
import models.JsonFormats.given
import play.api.mvc.*
import play.api.libs.json.*
import repositories.Onboarding.OnboardingRepository

import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class OnboardingController @Inject() (
    cc: ControllerComponents,
    onboardingRepository: OnboardingRepository,
    executionContext: ExecutionContext
) extends Controller(cc, executionContext) {
  /* Returns the saved onboarding survey answers for a participant so the survey
     Returns the saved object or JSON null. */
  def onboarding(participantId: Int): Action[AnyContent] = Action.async {
    onboardingRepository
      .onboarding(participantId)
      .map(result => Ok(Json.toJson(result)))
  }

  /* `?completed=true` marks this as a genuine finish of the onboarding flow, which
     refreshes the participant's onboarding time. The dashboard's "Update profile"
     path omits it, so editing a profile doesn't count as re-onboarding. */
  def saveOnboarding(participantId: Int): Action[JsValue] =
    Action.async(parse.json) { req =>
      val completed = req.getQueryString("completed").contains("true")
      req.body.validate[UpdateOnboarding] match {
        case JsSuccess(onboarding, _)
            if onboarding.callName.trim.nonEmpty && onboarding.age.isDefined =>
          onboardingRepository
            .saveOnboarding(participantId, onboarding, completed)
            .map(saved => Created(Json.toJson(saved)))
        case _ =>
          Future.successful(BadRequest(Json.obj("error" -> "Message failed")))
      }
    }
}
