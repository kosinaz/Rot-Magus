/**
 * Represents the selection frame around the selected character.
 *
 * @class SelectImage
 * @extends {Phaser.Scene}
 */
export default class SelectImage extends Phaser.GameObjects.Image {
  /**
   * Creates an instance of SelectImage.
   *
   * @param {*} scene
   * @memberof SelectImage
   */
  constructor(scene) {
    // Create the SelectImage.
    super(scene, 0, 0, 'gui', 'select');
    scene.add.existing(this);
    this.setDepth(3);
  }

  /**
   *
   *
   * @param {*} x
   * @param {*} y
   * @memberof SelectImage
   */
  moveTo(x, y) {
    this.x = x * 24;
    this.y = y * 21;
  }
}
