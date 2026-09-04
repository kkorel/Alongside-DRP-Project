import config.FlywayMigration

import javax.inject.*

@Singleton
final class AppStartup @Inject() (flywayMigration: FlywayMigration) {
  flywayMigration.migrate()
}
