class TextButton extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      config.scene, 
      config.x, 
      config.y,
      config.text,
      {
        'fill': config.fill || '#000',
        'fontFamily': config.font || 'font',
        'fontSize': config.size || '48px'
      }
    );
    this.setOrigin(config.origin);
    this.setInteractive();
    this.on('pointerup', config.onPointerUp);
  }
}