import CursorImage from './cursorImage.js';
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
    this.world.events.on('add', (entity) => {
      this.add.existing(new EntityImage(this, entity));
    });
    this.controller = new WorldController(this.world);
    this.downOn = null;
    this.input.on('gameobjectdown', (pointer, target) => {
      this.downOn = {
        pointer: pointer,
        target: target,
      };
      this.controller.onClick(this.downOn.pointer, this.downOn.target);
    });
    this.input.on('gameobjectup', (entity) => {
      this.downOn = null;
    });
    this.time.addEvent({
      delay: 250,
      loop: true,
      callback: () => {
        if (this.downOn !== null) {
          this.controller.onClick(this.downOn.pointer, this.downOn.target);
        }
      },
    });
    this.camera = new WorldSceneCameraManager(this);
    this.add.existing(new SelectImage(this, 1));
    this.add.existing(new QuestionImage(this, 1));
    this.icons = new Set();
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
}
