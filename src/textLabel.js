class TextLabel extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      config.scene,
      config.x,
      config.y,
      config.text, 
      {
        'fontFamily': config.font || 'font',
        'fontSize': config.size || '16px',
        'fill': config.fill !== undefined ? config.fill : '#000000'
      }
    );
    this.setOrigin(
      config.originX !== undefined ? config.originX : 0.5, 
      config.originY !== undefined ? config.originY : undefined
    );
    config.scene.add.existing(this);
  }
}