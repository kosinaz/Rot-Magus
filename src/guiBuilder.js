class GUIBuilder {
  static init(config) {
    this.defaultConfig = config;
  }
  static create(config) {
    if (config.type === 'Image') {
      let gameScene = game.scene.getScene(this.defaultConfig.gameScene);
      game.scene.getScene(this.defaultConfig.guiScene).add.image(
        config.x,
        config.y,
        config.texture,
        gameScene.player[config.frame]
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