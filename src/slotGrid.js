class SlotGrid {
  constructor(config) {
    this.slots = [];
    for (let y = 0; y < config.columns; y += 1) {
      for (let x = 0; x < config.rows; x += 1) {
        this.slots.push(new SlotImage({
          scene: config.scene,
          frame: config.frame,
          texture: config.texture,
          targetScene: config.targetScene,
          targetActor: config.targetActor,
          targetAttribute: config.targetAttribute,
          x: config.x + x * 24,
          y: config.y + y * 21,
          i: x + y * config.columns
        }));
      }
    }
  }
}