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
    this.map = new Map();
    this.actors = [];
    this.input.on('gameobjectup', this.controller.onClick, this);
    this.world.events.on('add', this.addEntity, this);
    this.world.create();
  }

  /**
   *
   *
   * @param {*} entity
   * @memberof WorldScene
   */
  addEntity(entity) {
    const entityImage = this.add.image(
        512 + entity.x * 24,
        288 + entity.y * 21,
        'tiles',
        entity.type.name,
    ).setData('data', entity).setInteractive().setAlpha(0);
    entity.events.on('show', () => {
      entityImage.setAlpha(1);
    });
  }
}
