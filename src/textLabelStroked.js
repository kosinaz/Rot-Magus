class TextLabelStroked extends TextLabel {
  constructor(config) {
    super(config);
    this.setStroke(
      config.stroke !== undefined ? config.stroke : '#000000',
      config.strokeThickness !== undefined ? config.strokeThickness : 3
    );
    this.setFontSize(config.size || '14px');
    this.setFill(config.fill !== undefined ? config.fill : '#e0e0e0');
  }
}