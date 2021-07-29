/**
 * Represents the question icon over the character awaiting order.
 *
 * @class QuestionImage
 * @extends {Phaser.Scene}
 */
export default class QuestionImage extends Phaser.GameObjects.Image {
  /**
   * Creates an instance of QuestionImage.
   *
   * @param {*} scene
   * @param {*} depth
   * @param {*} scroll
   * @memberof QuestionImage
   */
  constructor(scene, depth, scroll) {
    // Create the QuestionImage.
    super(scene, 0, 0, 'gui', 'question');
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
    this.x = image.x + 7;
    this.y = image.y - 6;
  }

  /**
   *
   *
   * @param {*} entity
   * @memberof SelectImage
   */
  moveToEntity(entity) {
    this.x = entity.x * 24 + 7;
    this.y = entity.y * 21 - 6;
  }
}
