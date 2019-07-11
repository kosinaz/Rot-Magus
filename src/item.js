class Item extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.config = this.scene.itemTypes[frame];
    this.setInteractive();
    this.scene.input.setDraggable(this);
    this.scene.add.existing(this);
  }
}