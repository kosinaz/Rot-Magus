import {color} from './consts.js';
import TextButton from './gui/textButton.js';
/**
 * Represents a scene that allows the player to browse and play random seeds.
 *
 * @class SeedBrowserScene
 * @extends {Phaser.Scene}
 */
export default class SeedBrowserScene extends Phaser.Scene {
  /**
   * Creates an instance of SeedBrowserScene.
   * @memberof SeedBrowserScene
   */
  constructor() {
    super('SeedBrowserScene');
  }

  /**
   * Creates the content of the scene.
   *
   * @memberof SeedBrowserScene
   */
  create() {
    const seed = ROT.RNG.getUniformInt(0, Number.MAX_SAFE_INTEGER);
    ROT.RNG.setSeed(seed);
    this.map = new SimplexMap(this, 'tiles', this.cache.json.get('mapConfig'));
    this.graphics = this.add.graphics();
    for (let x = 0; x < 1024; x += 1) {
      for (let y = 0; y < 576; y += 1) {
        this.graphics.fillStyle({
          waterTile: color.darkblue,
          ford: color.blue,
          marsh: color.green,
          grass: color.darkgreen,
          tree: color.darkbrown,
          bush: color.green,
          gravel: color.darkgray,
          mountain: color.gray,
          redFlower: color.red,
          yellowFlower: color.yellow,
          portalTile: color.white,
          stoneFloor: color.darkgray,
          gate: color.lightgray,
          stoneWall: color.gray,
          dirt: color.brown,
          sand: color.yellow,
          palmTree: color.green,
        }[this.map.getTileFrame(x - 512, y - 288)]);
        this.graphics.fillPoint(x, y);
      }
    }
    new TextButton({
      onPointerUp: () => {
        this.scene.start('GameScene');
      },
      origin: 0.5,
      scene: this,
      text: 'Start new game with seed: ' + ROT.RNG.getSeed(),
      x: 512,
      y: 440,
    });
    new TextButton({
      onPointerUp: () => {
        this.scene.restart();
      },
      origin: 0.5,
      scene: this,
      text: 'Change seed',
      x: 512,
      y: 490,
    });
    new TextButton({
      onPointerUp: () => {
        this.scene.scene.start('MenuScene');
        this.scene.scale.off('leavefullscreen');
      },
      origin: 0.5,
      scene: this,
      text: 'Back to main menu',
      x: 512,
      y: 540,
    });
  }
}
