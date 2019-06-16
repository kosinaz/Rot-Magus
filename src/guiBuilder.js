class GUIBuilder {
  static init(config) {
    this.defaultConfig = config;
  }
  static create(config) {
    if (config.type === 'Image') {
      game.scene.getScene(this.defaultConfig.sceneGUI).add.image(
        config.x,
        config.y,
        config.texture,
        player[config.frame]
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