class GUIBuilder {
  static init(config) {
    this.defaultConfig = config;
  }
  static create(config) {
    if (config.type === 'Image') {
      console.log()
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
  }
}