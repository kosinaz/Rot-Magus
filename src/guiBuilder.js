class GUIBuilder {
  static init(config) {
    this.defaultConfig = config;
    this.scene = game.scene.getScene(this.defaultConfig.scene);
  }
  static create(config) {
    if (config.type === 'Image') {
      let sourceScene = game.scene.getScene(this.defaultConfig.sourceScene);
      this.scene.add.image(
        config.x,
        config.y,
        config.texture,
        config.target ? sourceScene[config.target][config.frame] : config.frame
      );
    }
    if (config.type === 'TextLabel') {
      return new TextLabel({
        ...this.defaultConfig,
        ...config
      });
    }
    if (config.type === 'TextLabelStroked') {
      return new TextLabelStroked({
        ...this.defaultConfig,
        ...config
      });
    }
    if (config.type === 'TextLabelStrokedBar') {
      return new TextLabelStrokedBar({
        ...this.defaultConfig,
        ...config
      });
    }
    if (config.type === 'Slot') {
      return new Slot({
        ...this.defaultConfig,
        ...config
      });
    }
    if (config.type === 'Inventory' || config.type === 'Ground') {
      let inventory = [];
      for (let y = 0; y < config.columns; y += 1) {
        for (let x = 0; x < config.rows; x += 1) {
          let slot = new Slot({
            ...this.defaultConfig,
            ...config
          });
          slot.x += x * 24;
          slot.y += y * 21;
          slot.i = x + y * 10;
          slot.type = config.type;
          inventory.push(slot);
        }
      }
      return inventory;
    }
  }
}