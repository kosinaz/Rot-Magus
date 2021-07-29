/**
 * Represents the cursor on the map.
 *
 * @class CursorImage
 * @extends {Phaser.Scene}
 */
export default class CursorImage extends Phaser.GameObjects.Image {
  /**
   * Creates an instance of CursorImage.
   *
   * @param {*} scene
   * @memberof CursorImage
   */
  constructor(scene) {
    // Create the CursorImage.
    super(scene, 0, 0, 'gui', 'cursor');
    scene.add.existing(this);
    this.setDepth(1);
  }

  /**
   *
   *
   * @param {*} x
   * @param {*} y
   * @memberof CursorImage
   */
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}
