package repositories.QuietRoom

import config.DatabaseConfig
import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime
import javax.inject.*
import scala.concurrent.{ExecutionContext, Future}

import repositories.tables.*
import repositories.Repository

@Singleton
class QuietRoomRepository @Inject() (executionContext: ExecutionContext)
    extends Repository(executionContext) {
  private val reflections = TableQuery[ReflectionsTable]
  private val supportLinks = TableQuery[SupportLinksTable]
  private val meditationPlaylists = TableQuery[MeditationPlaylistsTable]
  private val userDoodles = TableQuery[UserDoodlesTable]

  /* Upsert the participant's reflection for this group: store every section and
     mark guided / free writing as shared with the facilitator independently.
     Sharing is additive — a later draft save never un-shares a shared section.
     The whole save is one DB write, so the caller can treat success as
     "persisted". */
  def createReflection(
      groupId: Int,
      request: CreateReflection
  ): Future[Reflection] = {
    val now = getCurrentTime()
    val privateNote = request.privateNote.map(_.trim).filter(_.nonEmpty)
    val facilitatorNote = request.facilitatorNote.map(_.trim).filter(_.nonEmpty)
    val freeWriting = request.freeWriting.map(_.trim).filter(_.nonEmpty)

    val existingQuery = reflections.filter(reflection =>
      reflection.groupId === groupId
        && reflection.participantId === request.participantId
    )

    db.run(existingQuery.result.headOption).flatMap {
      case Some(existing) =>
        val sharedGuided = existing.sharedGuided || request.shareGuided
        val sharedGuidedAt =
          if (request.shareGuided) Some(now) else existing.sharedGuidedAt
        val sharedFreeWriting =
          existing.sharedFreeWriting || request.shareFreeWriting
        val sharedFreeWritingAt =
          if (request.shareFreeWriting) Some(now)
          else existing.sharedFreeWritingAt

        val update = existingQuery
          .map(reflection =>
            (
              reflection.privateNote,
              reflection.facilitatorNote,
              reflection.freeWriting,
              reflection.sharedGuided,
              reflection.sharedGuidedAt,
              reflection.sharedFreeWriting,
              reflection.sharedFreeWritingAt
            )
          )
          .update(
            (
              privateNote,
              facilitatorNote,
              freeWriting,
              sharedGuided,
              sharedGuidedAt,
              sharedFreeWriting,
              sharedFreeWritingAt
            )
          )

        db.run(update)
          .map(_ =>
            existing.copy(
              privateNote = privateNote,
              facilitatorNote = facilitatorNote,
              freeWriting = freeWriting,
              sharedGuided = sharedGuided,
              sharedGuidedAt = sharedGuidedAt,
              sharedFreeWriting = sharedFreeWriting,
              sharedFreeWritingAt = sharedFreeWritingAt
            )
          )

      case None =>
        val reflection = Reflection(
          id = 0,
          groupId = groupId,
          participantId = request.participantId,
          privateNote = privateNote,
          facilitatorNote = facilitatorNote,
          freeWriting = freeWriting,
          sharedGuided = request.shareGuided,
          sharedGuidedAt = if (request.shareGuided) Some(now) else None,
          sharedFreeWriting = request.shareFreeWriting,
          sharedFreeWritingAt =
            if (request.shareFreeWriting) Some(now) else None,
          createdAt = now
        )
        val insert = (reflections returning reflections.map(_.id)) += reflection
        db.run(insert).map(newId => reflection.copy(id = newId))
    }
  }

  /* The participant's reflection for this group, so the quiet space can reload
     their saved draft (and what they have already shared). */
  def latestReflection(
      groupId: Int,
      participantId: Int
  ): Future[Option[Reflection]] =
    db.run(
      reflections
        .filter(reflection =>
          reflection.groupId === groupId
            && reflection.participantId === participantId
        )
        .sortBy(_.createdAt.desc)
        .result
        .headOption
    )

  /* Active facilitator-curated links for a group (plus links shown to all, where
     groupId is null), ordered by sortOrder. Only http(s) URLs are returned so a
     malicious javascript:/data: link can never reach the client. */
  def activeLinksForGroup(groupId: Int): Future[Seq[ReturnSupportLink]] =
    db.run(
      supportLinks
        .filter(_.isActive)
        .sortBy(link => (link.sortOrder.asc, link.id.asc))
        .result
    ).map(_.collect {
      case link if link.groupId.forall(_ == groupId) && isSafeUrl(link.url) =>
        ReturnSupportLink(link.id, link.title, link.url, link.description)
    })

  private def isSafeUrl(url: String): Boolean = {
    val scheme = url.trim.toLowerCase
    scheme.startsWith("http://") || scheme.startsWith("https://")
  }

  /* Active meditation playlists for a group (plus playlists shown to all, where
     groupId is null), ordered by sortOrder. Only genuine Spotify playlist URLs
     are returned, so a non-Spotify or non-playlist link can never reach the
     client. */
  def activeMeditationPlaylists(
      groupId: Int
  ): Future[Seq[ReturnMeditationPlaylist]] =
    db.run(
      meditationPlaylists
        .filter(_.isActive)
        .sortBy(playlist => (playlist.sortOrder.asc, playlist.id.asc))
        .result
    ).map(_.collect {
      case playlist
          if playlist.groupId.forall(_ == groupId)
            && isSpotifyPlaylistUrl(playlist.spotifyUrl) =>
        ReturnMeditationPlaylist(
          playlist.title,
          playlist.description,
          playlist.spotifyUrl,
          playlist.trackCount
        )
    })

  // Accept only https open.spotify.com/playlist/{id} links (optional query).
  private def isSpotifyPlaylistUrl(url: String): Boolean =
    url.trim.matches(
      "^https://open\\.spotify\\.com/playlist/[A-Za-z0-9]+(\\?[^\\s]*)?$"
    )

  /* Save a participant's doodle. Used both for "Keep this" (private) and for
     sharing with the facilitator (sharedWithFacilitator = true) — sharing is just
     a kept doodle with the flag set, mirroring how reflections model sharing. */
  def saveDoodle(groupId: Int, request: CreateDoodle): Future[ReturnDoodle] = {
    val now = getCurrentTime()
    val doodle = UserDoodle(
      id = 0,
      participantId = request.participantId,
      groupId = groupId,
      imageData = request.imageData,
      sharedWithFacilitator = request.sharedWithFacilitator,
      createdAt = now,
      updatedAt = now
    )
    val insert = (userDoodles returning userDoodles.map(_.id)) += doodle
    db.run(insert)
      .map(newId =>
        ReturnDoodle(newId, doodle.imageData, doodle.sharedWithFacilitator, now)
      )
  }

  /* The participant's kept doodles for this group, most recent first. Private to
     the participant. */
  def doodlesForParticipant(
      groupId: Int,
      participantId: Int
  ): Future[Seq[ReturnDoodle]] =
    db.run(
      userDoodles
        .filter(doodle =>
          doodle.groupId === groupId
            && doodle.participantId === participantId
        )
        .sortBy(_.createdAt.desc)
        .result
    ).map(
      _.map(doodle =>
        ReturnDoodle(
          doodle.id,
          doodle.imageData,
          doodle.sharedWithFacilitator,
          doodle.createdAt
        )
      )
    )
}
