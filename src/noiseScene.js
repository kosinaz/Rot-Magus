import Simplex from '../lib/rot/noise/simplex.js';
import OpenSimplexNoise from '../lib/OpenSimplexNoise.js';
import {color} from './consts.js';


/**
 * Represents a scene that serves as a test of different noise functions.
 *
 * @export
 * @class NoiseScene
 * @extends {Phaser.Scene}
 */
export default class NoiseScene extends Phaser.Scene {
  /**
   * Creates an instance of NoiseScene.
   * @memberof NoiseScene
   */
  constructor() {
    // Create the NoiseScene just like any Phaser scene.
    super('NoiseScene');
  }

  /**
   * Creates the content of the scene.
   *
   * @memberof NoiseScene
   */
  create() {
    const rot = new Simplex();
    const osn = new OpenSimplexNoise(ROT.RNG.getUniformInt(0, 100000));
    const graphics = this.add.graphics();
    graphics.lineStyle(1, color.black, 1);
    const rotvalues = [];
    const osnvalues = [];
    let rotMax = 0;
    let osnMax = 0;
    let value = 0;
    for (let i = 0; i < 25000; i += 1) {
      value = Math.round(rot.get(i, -i) * 250) + 250;
      rotvalues[value] = (rotvalues[value] || 0) + 1;
      rotMax = Math.max(rotMax, rotvalues[value]);
    }
    for (let x = 0; x < 500; x += 1) {
      graphics.lineBetween(10 + x, 500 - rotvalues[x], 10 + x, 500);
    }
    for (let i = 0; i < 25000; i += 1) {
      value = Math.round(osn.evaluate2D(i, -i) * 250) + 250;
      osnvalues[value] = (osnvalues[value] || 0) + 1;
      osnMax = Math.max(osnMax, osnvalues[value]);
    }
    for (let x = 0; x < 500; x += 1) {
      graphics.lineBetween(510 + x, 500 - osnvalues[x], 510 + x, 500);
    }
    this.add.text(
        250,
        520,
        `rot.js Simplex\nmax: ${rotMax}/25000 (${~~(rotMax / 250)}%)`, {
          color: '#000',
          align: 'center',
        }).setOrigin(0.5);
    this.add.text(
        750,
        520,
        `Spongman Simplex\nmax: ${osnMax}/25000 (${~~(osnMax / 250)}%)`, {
          color: '#000',
          align: 'center',
        }).setOrigin(0.5);
    this.input.on('pointerdown', () => {
      this.scene.restart();
    }, this);
  }
}
