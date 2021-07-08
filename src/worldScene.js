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
    this.world.map.forEach((value, key) => {
      const keyParts = key.split(',');
      const x = (~~keyParts[1] + 15) * 24;
      const y = (~~keyParts[2] + 15) * 21;
      if (keyParts[0] === 'terrain') {
        this.add.image(x, y, 'tiles', value)
            .setData('data', value).setInteractive();
      } else {
        console.log(value);
        this.add.image(x, y, 'tiles', value.type.name)
            .setData('data', value).setInteractive();
      }
    });
    this.controller = new WorldController(this.world);
    this.input.on('gameobjectup', this.controller.onClick);
  }
}
