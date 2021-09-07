/* global Phaser */
import EntityIconImage from './entityIconImage.js';
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
    this.setDepth(entity.layer === 'actor' ? 1 : 0);
    if (entity.isPC) {
      scene.add.existing(new EntityIconImage(scene, entity));
    }
    this.on('pointerover', () => {
      scene.cursor.moveToImage(this);
      scene.hint.setText(entity.type.name);
    });
    entity.events.on('show', () => {
      //console.log(entity.type.name, this.depth);
      if (entity.layer === 'actor') {
        entity.timeline.play();
        entity.timeline = scene.tweens.createTimeline();
      }
      this.setAlpha(1);
    });
    entity.events.on('hide', () => {
      this.setAlpha(entity.layer === 'actor' ? 0 : 0.5);
    });
    entity.events.on('move', () => {
      entity.timeline.add({
        targets: this,
        x: entity.x * 24,
        y: entity.y * 21,
        duration: 1000 / entity.speed,
      });
    });
    scene.world.events.on('select', (actor) => {
      if (entity === actor) {
        scene.selectedImage = this;
      }
    });
    entity.timeline = scene.tweens.createTimeline();
  }
}
