import TextButton from './gui/textButton.js';
import Settings from './settings/settings.js';
/**
 * Represents the scene where the settings of the game can be adjusted.
 *
 * @export
 * @class SettingScene
 * @extends {Phaser.Scene}
 */
export default class SettingScene extends Phaser.Scene {
  /**
   * Creates an instance of SettingScene.
   * @memberof SettingScene
   */
  constructor() {
    super('SettingScene');
  }

  /**
   * Creates the content of the scene.
   *
   * @memberof SettingScene
   */
  create() {
    this.cameras.main.setBackgroundColor('#616161');
    const fullscreenButton = new TextButton({
      onPointerUp: () => {
        this.scale.toggleFullscreen();
      },
      origin: 0.5,
      scene: this,
      text: 'Screen: ' + (this.scale.isFullscreen ? 'Fullscreen' : 'Windowed'),
      x: 512,
      y: 200,
    });
    this.scale.on('enterfullscreen', () => {
      fullscreenButton.text = 'Screen: Fullscreen';
    });
    this.scale.on('leavefullscreen', () => {
      fullscreenButton.text = 'Screen: Windowed';
    });
    const speedButton = new TextButton({
      onPointerUp: () => {
        Settings.changeSpeed();
        speedButton.text = 'Game speed: ' + Settings.speed;
      },
      origin: 0.5,
      scene: this,
      text: 'Game speed: ' + Settings.speed,
      x: 512,
      y: 250,
    });
    new TextButton({
      onPointerUp: () => {
        this.scene.start('MenuScene');
        this.scale.off('leavefullscreen');
      },
      origin: 0.5,
      scene: this,
      text: 'Back to main menu',
      x: 512,
      y: 540,
    });
  }
}