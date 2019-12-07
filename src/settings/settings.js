/**
 * Represents the collection of game settings.
 *
 * @export
 * @class Settings
 */
export default class Settings {
  /**
   * Increase the speed on ingame animations by one, return to one when
   * speed level five is reached.
   *
   * @static
   * @memberof Settings
   */
  static changeSpeed() {
    Settings.speed = Settings.speed === 5 ? 1 : Settings.speed + 1;
  }
}
Settings.speed = 3;
