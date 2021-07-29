import CursorImage from './cursorImage.js';
import EntityIconImage from './entityIconImage.js';
import EntityImage from './entityImage.js';
import HintText from './hintText.js';
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
    const select = this.add.existing(new SelectImage(this, 1));
    this.world.events.on('select', (actor) => select.moveToEntity(actor));
    const question = this.add.existing(new QuestionImage(this, 1));
    this.world.events.on('pause', (actor) => question.moveToEntity(actor));
    this.selectIcon = this.add.existing(new SelectImage(this, 3, 0));
    this.questionIcon = this.add.existing(new QuestionImage(this, 3, 0));
    this.cursor = this.add.existing(new CursorImage(this));
    this.hint = this.add.existing(new HintText(this));
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
    const entityImage = this.add.existing(new EntityImage(this, entity));
    if (entity.isPC) {
      this.add.existing(new EntityIconImage(this, entity));
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
