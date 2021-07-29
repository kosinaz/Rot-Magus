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
   * @param {*} depth
   * @param {*} scroll
   * @memberof SelectImage
   */
  constructor(scene, depth, scroll) {
    // Create the SelectImage.
    super(scene, 0, 0, 'gui', 'select');
    scene.add.existing(this);
    this.setDepth(depth);
    if (scroll !== undefined) {
      this.setScrollFactor(scroll);
    }
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
