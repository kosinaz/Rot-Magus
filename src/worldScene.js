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
    const tile = this.add.image(100, 100, 'tiles', 'demon');
    tile.data = this.world.map.get('actor2,2');
    tile.setInteractive();
    tile.on('pointerdown', () => this.controller.onPointerDown(tile));
  }
}
