class PortraitGrid {
  constructor(config) {
    this.portraits = [];
    for (let y = 0; y < config.rows; y += 1) {
      for (let x = 0; x < config.columns; x += 1) {
        this.portraits.push(new Portrait({
          ...config,
          ...{
            frame: config.frame,
            i: x + y * config.columns,
            scene: config.scene,
            targetActor: config.targetActor,
            targetAttribute: config.targetAttribute,
            targetScene: config.targetScene,
            texture: config.texture,
            x: config.x + x * 24,
            y: config.y + y * 21
          }
        }));
      }
    }
  }
}