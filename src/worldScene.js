import CursorImage from './cursorImage.js';
import QuestionImage from './questionImage.js';
import SelectImage from './selectImage.js';
import World from './world/world.js';
import WorldController from './world/worldController.js';
import WorldSceneCameraManager from './worldSceneCameraManager.js';

/**
 * Represents the scene where the gameplay itself happens.
 *
 * @class WorldScene
 * @extends {Phaser.Scene}
 */
export default class WorldScene extends Phaser.Scene {
  /**
   * Creates an instance of WorldScene.
   *
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
    this.world = new World({
      actorTypes: this.cache.json.get('actorTypes'),
      pcs: config.pcs,
    });
    this.world.events.on('add', this.addEntity, this);
    this.controller = new WorldController(this.world);
    this.input.on('gameobjectup', this.controller.onClick, this.controller);
    this.camera = new WorldSceneCameraManager(this);
    this.icons = new Set();
    const select = new SelectImage(this, 1);
    this.world.events.on('select', (actor) => select.moveTo(actor.x, actor.y));
    const question = new QuestionImage(this, 1);
    this.world.events.on('pause', (actor) => question.moveTo(actor.x, actor.y));
    this.selectIcon = new SelectImage(this, 3, 0);
    this.questionIcon = new QuestionImage(this, 3, 0);
    this.cursor = new CursorImage(this);
    this.hint = this.add.bitmapText(1000, 42, 'font', '');
    this.hint.setOrigin(1).setRightAlign().setScrollFactor(0).setDepth(3);
    this.world.create();
  }

  /**
   *
   *
   * @param {*} time
   * @param {*} delta
   * @memberof WorldScene
   */
  update(time, delta) {
    this.camera.update(delta);
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
      this.cursor.moveTo(entityImage.x, entityImage.y);
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
