class GUIBuilder {
  static create(config) {
    if (config.type === 'Image') {
      game.scene.getScene(config.sceneGUI).add.image(
        config.x, 
        config.y, 
        config.texture, 
        player[config.frame]
      );
    }
    if (config.type === 'TextLabel') {
      return new TextLabel(config);
    }
    if (config.type === 'TextLabelStroked') {
      return new TextLabelStroked(config);
    }
    if (config.type === 'TextLabelStrokedBar') {
      return new TextLabelStrokedBar(config);
    }
  }
}