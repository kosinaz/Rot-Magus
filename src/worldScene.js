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
    this.input.on('gameobjectup', this.controller.onClick, this.controller);
    this.world.events.on('add', this.addEntity, this);
    const select = this.add.image(512, 288, 'gui', 'select');
    select.setDepth(1);
    this.world.events.on('select', (actor) => {
      select.x = 512 + actor.x * 24;
      select.y = 288 + actor.y * 21;
    });
    this.world.create();
    this.cursor = this.add.image(512, 309, 'gui', 'cursor');
    this.cursor.setDepth(1);
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
    entityImage.on('pointerover', () => {
      this.cursor.x = entityImage.x;
      this.cursor.y = entityImage.y;
    });
    entity.events.on('reveal', () => {
      entityImage.setAlpha(1);
    });
    entity.events.on('hide', () => {
      entityImage.setAlpha(entity.layer === 'actor' ? 0 : 0.5);
    });
    entity.events.on('move', () => {
      entity.timeline.add({
        targets: entityImage,
        x: 512 + entity.x * 24,
        y: 288 + entity.y * 21,
        duration: 1000 / entity.speed,
      });
    });
    entity.events.on('show', () => {
      entity.timeline.play();
      entity.timeline = this.tweens.createTimeline();
    });
    entity.timeline = this.tweens.createTimeline();
  }
}
