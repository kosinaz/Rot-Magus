/* global Phaser */
import MenuScene from './menuScene.js';

/**
 * Represents the scene that loads all the resources that the game uses.
 *
 * @export
 * @class LoadScene
 * @extends {Phaser.Scene}
 */
export default class LoadScene extends Phaser.Scene {
  /**
   * Creates an instance of LoadScene.
   * @memberof LoadScene
   */
  constructor() {
    // Create the LoadScene just like any Phaser scene.
    super('LoadScene');
  }

  /**
   * Loads all the resources that the game uses.
   *
   * @memberof LoadScene
   */
  preload() {
    this.add.text(400, 250, 'Traversing Hyperspace...');
    this.load.atlas('tiles', 'images/tiles.png', 'images/tiles.json');
    this.load.atlas('gui', 'images/gui.png', 'images/gui.json');
    this.load.bitmapFont('font', 'images/font.png', 'images/font.xml');
    this.load.json('actorTypes', 'data/actorTypes.json');
    this.load.json('itemTypes', 'data/itemTypes.json');
    this.load.json('guiElements', 'data/guiElements.json');
    this.load.json('mapConfig', 'data/mapConfig.json');
    this.load.json('levels', 'data/levels.json');
  }

  /**
   * Starts the next scene after it has loaded everything.
   *
   * @memberof LoadScene
   */
  create() {
    // Add the menu scene but don't autostart it as it won't stop this scene.
    this.scene.add('MenuScene', MenuScene);

    // Start the menu scene and stop this scene.
    this.scene.start('MenuScene');
  }
}
