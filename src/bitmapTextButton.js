class BitmapTextButton extends Phaser.GameObjects.BitmapText {
  constructor(config) {
    super(
      config.scene, 
      config.x, 
      config.y, 
      config.font, 
      config.text, 
      config.size, 
      config.align
    );
    this.setOrigin(config.origin);
    this.setTint(config.tint);
    this.setInteractive();
    this.on('pointerup', config.onPointerUp);
  }
}