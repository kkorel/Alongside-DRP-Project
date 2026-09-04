package repositories

import config.DatabaseConfig
import slick.jdbc.PostgresProfile.api.*

import java.time.{LocalDateTime, ZoneId}
import javax.inject.*
import scala.concurrent.ExecutionContext

@Singleton
private abstract class Repository @Inject() (
    executionContext: ExecutionContext
) {
  protected given ExecutionContext = executionContext

  private val databaseConfig = DatabaseConfig.fromEnvironment()

  protected val db = Database.forURL(
    url = databaseConfig.jdbcUrl,
    user = databaseConfig.username,
    password = databaseConfig.password,
    driver = "org.postgresql.Driver"
  )

  protected def getCurrentTime(): LocalDateTime =
    LocalDateTime.now(ZoneId.of("Europe/London"))
}
