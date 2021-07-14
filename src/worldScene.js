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
    this.cameras.main.setBackgroundColor('#000000');
    const cursors = this.input.keyboard.createCursorKeys();
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5,
    });
    document.addEventListener('mouseenter', () => {
      this.mouseover = true;
    });
    document.addEventListener('mouseleave', () => {
      this.mouseover = false;
    });
    this.world = new World({
      actorTypes: this.cache.json.get('actorTypes'),
    });
    this.icons = new Set();
    this.controller = new WorldController(this.world);
    this.input.on('gameobjectup', this.controller.onClick, this.controller);
    this.world.events.on('add', this.addEntity, this);
    const select = this.add.image(0, 0, 'gui', 'select');
    select.setDepth(1);
    this.world.events.on('select', (actor) => {
      select.x = actor.x * 24;
      select.y = actor.y * 21;
    });
    this.world.create();
    this.cursor = this.add.image(0, 0, 'gui', 'cursor');
    this.cursor.setDepth(1);
  }

  /**
   *
   *
   * @param {*} time
   * @param {*} delta
   * @memberof WorldScene
   */
  update(time, delta) {
    this.controls.update(delta);
    if (this.mouseover) {
      if (this.input.activePointer.x < 24) {
        this.cameras.main.scrollX -= 8;
      };
      if (1000 < this.input.activePointer.x) {
        this.cameras.main.scrollX += 8;
      };
      if (this.input.activePointer.y < 21) {
        this.cameras.main.scrollY -= 8;
      };
      if (555 < this.input.activePointer.y) {
        this.cameras.main.scrollY += 8;
      };
    }
  }

  /**
   *
   *
   * @param {*} entity
   * @memberof WorldScene
   */
  addEntity(entity) {
    const entityImage = this.add.image(
        entity.x * 24,
        entity.y * 21,
        'tiles',
        entity.type.name,
    ).setData('data', entity).setInteractive().setAlpha(0);
    entityImage.on('pointerover', () => {
      this.cursor.x = entityImage.x;
      this.cursor.y = entityImage.y;
    });
    if (entity.isPC) {
      const entityIcon = this.add.image(0, 0, 'tiles', entity.type.name)
          .setInteractive().setScrollFactor(0).setDepth(2);
      entityIcon.on('pointerup', () => {
        this.cameras.main.scrollX = entityImage.x - 512;
        this.cameras.main.scrollY = entityImage.y - 288;
      });
      this.icons.add(entityIcon);
      // eslint-disable-next-line new-cap
      Phaser.Actions.PlaceOnLine(
          [...this.icons],
          new Phaser.Geom.Line(36, 31, 36 + [...this.icons].length * 24, 31),
      );
      console.log([...this.icons].length);
    }
    entity.events.on('reveal', () => {
      entityImage.setAlpha(1);
    });
    entity.events.on('hide', () => {
      entityImage.setAlpha(entity.layer === 'actor' ? 0 : 0.5);
    });
    entity.events.on('move', () => {
      entity.timeline.add({
        targets: entityImage,
        x: entity.x * 24,
        y: entity.y * 21,
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
