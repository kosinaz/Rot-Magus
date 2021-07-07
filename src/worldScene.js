import World from './world/world.js';
import WorldController from './world/worldController.js';

/**
 * Represents the scene where the gameplay itself happens.
 *
 * @class WorldScene
 * @extends {Phaser.Scene}
 */
export default class WorldScene extends Phaser.Scene {
  /**
   * Creates an instance of WorldScene.
   * @memberof WorldScene
   */
  constructor() {
    // Create the WorldScene just like any Phaser scene.
    super('WorldScene');
  }

  /**
   * Creates the content of the world.
   *
   * @memberof WorldScene
   */
  create() {
    this.world = new World({
      actorTypes: this.cache.json.get('actorTypes'),
    });
    this.controller = new WorldController(this.world);
    this.add.image(100, 50, 'tiles', 'elfMale')
        .setData('data', this.world.map.get('actor0,0'))
        .setInteractive();
    this.add.image(100, 100, 'tiles', 'demon')
        .setData('data', this.world.map.get('actor2,2'))
        .setInteractive();
    this.input.on('gameobjectup', this.controller.onClick);
  }
}
