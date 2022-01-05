/* global Phaser */
import CursorImage from './cursorImage.js';
import EntityImage from './entityImage.js';
import HintText from './hintText.js';
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
    this.input.on('gameobjectup', this.controller.onClick, this);
    this.camera = new WorldSceneCameraManager(this);
    this.select = this.add.existing(new SelectImage(this, 2));
    this.icons = new Set();
    this.selectIcon = this.add.existing(new SelectImage(this, 3, 0));
    this.cursor = this.add.existing(new CursorImage(this));
    this.hint = this.add.existing(new HintText(this));
    this.world.start();
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
    if (this.selectedImage) {
      this.select.moveToImage(this.selectedImage);
    }
  }
}
