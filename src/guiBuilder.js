class GUIBuilder {
  static init(config) {
    this.defaultConfig = config;
  }
  static create(config) {
    if (config.type === 'Image') {
      let sourceScene = game.scene.getScene(this.defaultConfig.sourceScene);
      game.scene.getScene(this.defaultConfig.scene).add.image(
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
    if (config.type === 'Socket') {
      return new Socket({
        ...this.defaultConfig,
        ...config
      });
    }
    if (config.type === 'Inventory') {
      for (let x = 0; x < config.columns; x += 1) {
        for (let y = 0; y < config.rows; y += 1) {
          let socket = new Socket({
            ...this.defaultConfig,
            ...config
          });
          socket.x += x * 24;
          socket.y += y * 21;
        }
      }
    }
  }
}