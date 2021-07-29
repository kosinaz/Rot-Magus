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
   * @param {*} image
   * @memberof SelectImage
   */
  moveToImage(image) {
    this.x = image.x;
    this.y = image.y;
  }

  /**
   *
   *
   * @param {*} entity
   * @memberof SelectImage
   */
  moveToEntity(entity) {
    this.x = entity.x * 24;
    this.y = entity.y * 21;
  }
}
