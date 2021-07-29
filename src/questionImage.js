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
    this.setDepth(1);
  }

  /**
   *
   *
   * @param {*} actor
   * @memberof QuestionImage
   */
  moveTo(actor) {
    this.x = actor.x * 24 + 7;
    this.y = actor.y * 21 - 6;
  }
}
