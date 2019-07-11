class Slot extends Phaser.GameObjects.Image {
  constructor(config) {
    super(
      game.scene.getScene(config.scene), 
      config.x, 
      config.y, 
      config.texture, 
      config.frame
    );
    this.setOrigin(config.origin);
    this.setInteractive();
    this.scene.add.existing(this);
  }
}