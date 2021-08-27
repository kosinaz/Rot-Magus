/* global Phaser */
/**
 * Represents the entity icon.
 *
 * @class EntityIconImage
 * @extends {Phaser.Scene}
 */
export default class EntityIconImage extends Phaser.GameObjects.Image {
  /**
   * Creates an instance of EntityIconImage.
   *
   * @param {*} scene
   * @param {*} entity
   * @memberof EntityIconImage
   */
  constructor(scene, entity) {
    // Create the EntityIconImage.
    super(scene, 0, 0, 'tiles', entity.type.image);
    scene.icons.add(this);
    this.setInteractive();
    this.setScrollFactor(0);
    this.setDepth(2);
    this.on('pointerup', () => {
      scene.cameras.main.scrollX = this.x - 512;
      scene.cameras.main.scrollY = this.y - 288;
      scene.world.select(entity);
    });
    // eslint-disable-next-line new-cap
    Phaser.Actions.PlaceOnLine(
      [...scene.icons],
      new Phaser.Geom.Line(36, 31, 36 + [...scene.icons].length * 24, 31),
    );
    scene.world.events.on('select', (actor) => {
      if (actor === entity) {
        scene.selectIcon.moveToImage(this);
      }
    });
  }
}
