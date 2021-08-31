/* global Phaser */
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
    this.setDepth(2);
  }

  /**
   *
   *
   * @param {*} image
   * @param {*} y
   * @memberof CursorImage
   */
  moveToImage(image) {
    this.x = image.x;
    this.y = image.y;
  }
}
