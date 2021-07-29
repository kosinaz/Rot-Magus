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
   *
   *
   * @param {*} config
   * @memberof WorldScene
   */
  create(config) {
    this.cameras.main.scrollX = -512;
    this.cameras.main.scrollY = -288;
    const keys = this.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
    this.cursorControls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.cameras.main,
      left: keys.LEFT,
      right: keys.RIGHT,
      up: keys.UP,
      down: keys.DOWN,
      speed: 0.5,
    });
    this.wasdControls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.cameras.main,
      left: keys.A,
      right: keys.D,
      up: keys.W,
      down: keys.S,
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
      pcs: config.pcs,
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
    const question = this.add.image(0, 0, 'gui', 'question');
    question.setDepth(1);
    this.world.events.on('pause', (actor) => {
      question.x = actor.x * 24 + 7;
      question.y = actor.y * 21 - 6;
    });
    this.selectIcon = this.add.image(0, 0, 'gui', 'select');
    this.selectIcon.setScrollFactor(0).setDepth(3);
    this.questionIcon = this.add.image(0, 0, 'gui', 'question');
    this.questionIcon.setScrollFactor(0).setDepth(3);
    this.world.create();
    this.cursor = this.add.image(0, 0, 'gui', 'cursor');
    this.cursor.setDepth(1);
    this.hint = this.add.bitmapText(1000, 42, 'font', '');
    this.hint.setOrigin(1).setRightAlign().setScrollFactor(0).setDepth(3);
  }

  /**
   *
   *
   * @param {*} time
   * @param {*} delta
   * @memberof WorldScene
   */
  update(time, delta) {
    this.cursorControls.update(delta);
    this.wasdControls.update(delta);
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
        entity.type.image,
    ).setData('data', entity).setInteractive().setAlpha(0);
    entityImage.on('pointerover', () => {
      this.cursor.x = entityImage.x;
      this.cursor.y = entityImage.y;
      this.hint.setText(entity.type.name);
    });
    if (entity.isPC) {
      const entityIcon = this.add.image(0, 0, 'tiles', entity.type.image)
          .setInteractive().setScrollFactor(0).setDepth(2);
      entityIcon.on('pointerup', () => {
        this.cameras.main.scrollX = entityImage.x - 512;
        this.cameras.main.scrollY = entityImage.y - 288;
        this.world.select(entity);
      });
      this.icons.add(entityIcon);
      // eslint-disable-next-line new-cap
      Phaser.Actions.PlaceOnLine(
          [...this.icons],
          new Phaser.Geom.Line(36, 31, 36 + [...this.icons].length * 24, 31),
      );
      this.world.events.on('select', (actor) => {
        if (actor === entity) {
          this.selectIcon.x = entityIcon.x;
          this.selectIcon.y = entityIcon.y;
        }
      });
      this.world.events.on('pause', (actor) => {
        if (actor === entity) {
          this.questionIcon.x = entityIcon.x + 7;
          this.questionIcon.y = entityIcon.y - 6;
        }
      });
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
