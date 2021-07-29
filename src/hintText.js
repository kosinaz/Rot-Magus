/**
 * Represents the hint about the tile currently under the cursor.
 *
 * @class HintText
 * @extends {Phaser.Scene}
 */
export default class HintText extends Phaser.GameObjects.BitmapText {
  /**
   * Creates an instance of HintText.
   *
   * @param {*} scene
   * @memberof HintText
   */
  constructor(scene) {
    // Create the HintText.
    super(scene, 1000, 42, 'font', '');
    this.setOrigin(1);
    this.setRightAlign();
    this.setScrollFactor(0);
    this.setDepth(3);
  }
}
