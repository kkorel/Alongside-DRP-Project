import com.google.inject.AbstractModule

final class Module extends AbstractModule {
  override def configure(): Unit = {
    bind(classOf[AppStartup]).asEagerSingleton()
  }
}
