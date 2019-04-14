class TextButton extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      config.scene, 
      config.x, 
      config.y,
      config.text,
      {
        'fontFamily': config.font || 'font',
        'fontSize': config.size || '48px',
        'fill': config.fill || '#fff'
      }
    );
    this.setOrigin(config.origin);
    this.setInteractive();
    this.on('pointerup', config.onPointerUp);
  }
}