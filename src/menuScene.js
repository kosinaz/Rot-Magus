/* global Phaser */
import CreateCharacterScene from './createCharacterScene.js';

/**
 * Represents the scene of the main menu.
 *
 * @export
 * @class MenuScene
 * @extends {Phaser.Scene}
 */
export default class MenuScene extends Phaser.Scene {
  /**
   * Creates an instance of MenuScene.
   * @memberof MenuScene
   */
  constructor() {
    // Create the MenuScene just like any Phaser scene.
    super('MenuScene');
  }

  /**
   *
   *
   * @memberof MenuScene
   */
  create() {
    // Add the character creation scene.
    this.scene.add('CreateCharacterScene', CreateCharacterScene);

    // Start the character creation scene and stop this scene.
    this.scene.start('CreateCharacterScene');
  }
}
