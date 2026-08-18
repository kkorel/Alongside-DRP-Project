package repositories.tables

import models.*
import slick.jdbc.PostgresProfile.api.*

import java.time.LocalDateTime

class MeditationPlaylistsTable(tag: Tag)
    extends Table[MeditationPlaylist](tag, "meditation_playlists") {
  def id = column[Int]("id", O.PrimaryKey, O.AutoInc)
  def groupId = column[Option[Int]]("group_id")
  def title = column[String]("title")
  def description = column[Option[String]]("description")
  def spotifyUrl = column[String]("spotify_url")
  def trackCount = column[Option[Int]]("track_count")
  def sortOrder = column[Int]("sort_order")
  def isActive = column[Boolean]("is_active")
  def createdAt = column[LocalDateTime]("created_at")
  def updatedAt = column[LocalDateTime]("updated_at")

  def * =
    (
      id,
      groupId,
      title,
      description,
      spotifyUrl,
      trackCount,
      sortOrder,
      isActive,
      createdAt,
      updatedAt
    ).mapTo[MeditationPlaylist]
}
