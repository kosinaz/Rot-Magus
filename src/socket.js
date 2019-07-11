class Socket extends Phaser.GameObjects.Image {
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
    this.input.dropZone = true;
    this.scene.add.existing(this);
  }
}