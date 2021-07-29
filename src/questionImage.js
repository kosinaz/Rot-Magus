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
   * @memberof QuestionImage
   */
  constructor(scene) {
    // Create the QuestionImage.
    super(scene, 0, 0, 'gui', 'question');
    scene.add.existing(this);
    this.setDepth(3);
  }

  /**
   *
   *
   * @param {*} x
   * @param {*} y
   * @memberof QuestionImage
   */
  moveTo(x, y) {
    this.x = x * 24 + 7;
    this.y = y * 21 - 6;
  }
}
