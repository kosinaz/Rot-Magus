class TextLabelStroked extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      config.scene,
      config.x,
      config.y,
      config.text, 
      {
        'fontFamily': config.font || 'font',
        'fontSize': config.size || '14px',
        'fill': config.fill !== undefined ? config.fill : '#ffffff',
        'stroke': config.stroke !== undefined ? config.stroke : '#000000',
        'strokeThickness': config.strokeThickness !== undefined ? config.strokeThickness : 3
      }
    );
    this.setOrigin(
      config.originX !== undefined ? config.originX : 0.5,
      config.originY !== undefined ? config.originY : undefined
    );
    config.scene.add.existing(this);
  }
}