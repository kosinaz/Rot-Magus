class SlotGrid {
  constructor(config) {
    this.slots = [];
    for (let y = 0; y < config.rows; y += 1) {
      for (let x = 0; x < config.columns; x += 1) {
        this.slots.push(new SlotImage({
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