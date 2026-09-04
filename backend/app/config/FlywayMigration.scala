package config

import javax.inject._
import org.flywaydb.core.Flyway

@Singleton
final class FlywayMigration @Inject() () {
  def migrate(): Unit = {
    val databaseConfig = DatabaseConfig.fromEnvironment()

    val flyway = Flyway
      .configure()
      .dataSource(
        databaseConfig.jdbcUrl,
        databaseConfig.username,
        databaseConfig.password
      )
      .locations("classpath:db/migration")
      .load()

    flyway.migrate()
  }
}
