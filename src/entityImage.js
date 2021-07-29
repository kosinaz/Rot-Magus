/**
 * Represents the selection frame around the selected character.
 *
 * @class EntityImage
 * @extends {Phaser.Scene}
 */
export default class EntityImage extends Phaser.GameObjects.Image {
  /**
   * Creates an instance of EntityImage.
   *
   * @param {*} scene
   * @param {*} entity
   * @memberof EntityImage
   */
  constructor(scene, entity) {
    // Create the EntityImage.
    super(scene, entity.x * 24, entity.y * 21, 'tiles', entity.type.image);
    this.setData('data', entity);
    this.setInteractive();
    this.setAlpha(0);
    this.on('pointerover', () => {
      scene.cursor.moveToImage(this);
      scene.hint.setText(entity.type.name);
    });
  }
}
