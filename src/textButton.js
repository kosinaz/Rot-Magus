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
        'fill': config.fill !== undefined ? config.fill : '#ffff00',
        'stroke': config.stroke !== undefined ? config.stroke : '#000000',
        'strokeThickness': 
          config.strokeThickness !== undefined ? config.strokeThickness : 6
      }
    );
    this.setOrigin(config.origin);
    this.setInteractive();
    this.on('pointerup', config.onPointerUp);
    config.scene.add.existing(this);
  }
}