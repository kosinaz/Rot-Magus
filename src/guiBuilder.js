class GUIBuilder {
  static init(config) {
    this.defaultConfig = config;
    this.scene = game.scene.getScene(this.defaultConfig.scene);
    this.classes = {
      TextLabel,
      TextLabelStroked,
      TextLabelStrokedBar,
      SlotImage
    };
  }
  static create(config) {
    if (config.type === 'Image') {
      let sourceScene = game.scene.getScene(this.defaultConfig.sourceScene);
      return this.scene.add.image(
        config.x,
        config.y,
        config.texture,
        config.target ? sourceScene[config.target][config.frame] : config.frame
      );
    }
    if (config.type === 'TextLabel') {
      return new this.classes[config.type]({
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
      return new this.classes[config.type]({
        ...this.defaultConfig,
        ...config
      });
    }
    if (config.type === 'SlotImage') {
      return new SlotImage({
        ...this.defaultConfig,
        ...config
      });
    }
    if (config.type === 'SlotGrid') {
      let inventory = [];
      for (let y = 0; y < config.columns; y += 1) {
        for (let x = 0; x < config.rows; x += 1) {
          let slot = new SlotImage({
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