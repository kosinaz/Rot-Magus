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
    this.setDepth(1);
  }

  /**
   *
   *
   * @param {*} actor
   * @memberof SelectImage
   */
  moveTo(actor) {
    this.x = actor.x * 24;
    this.y = actor.y * 21;
  }
}
