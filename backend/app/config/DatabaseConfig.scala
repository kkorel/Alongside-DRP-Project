package config

import java.net.URI

final case class DatabaseConfig(
    jdbcUrl: String,
    username: String,
    password: String
)

object DatabaseConfig {
  def fromEnvironment(): DatabaseConfig = {
    val databaseUrl = sys.env.getOrElse(
      "DATABASE_URL",
      throw new IllegalStateException(
        "DATABASE_URL environment variable is not set"
      )
    )

    val uri = new URI(databaseUrl)

    val Array(username, password) = uri.getUserInfo.split(":", 2)

    val jdbcUrl =
      s"jdbc:postgresql://${uri.getHost}:${uri.getPort}${uri.getPath}?sslmode=require"

    DatabaseConfig(
      jdbcUrl = jdbcUrl,
      username = username,
      password = password
    )
  }
}
