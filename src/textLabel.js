class TextLabel extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x,
      config.y,
      config.text, 
      {
        'fontFamily': config.fontFamily,
        'fontSize': config.fontSize,
        'fill': config.fill
      }
    );
    this.config = config;
    this.separator = config.separator;
    this.tooltip = config.tooltip;
    this.targetActor = config.targetActor;
    this.targetAttribute = config.targetAttribute;
    this.targetAttributeMax = config.targetAttributeMax;
    this.setOrigin(
      config.originX !== undefined ? config.originX : 0.5, 
      config.originY !== undefined ? config.originY : undefined
    );    
    this.targetScene = game.scene.getScene(config.targetScene);
    this.targetScene.events.on(config.event, this.draw.bind(this));
    if (this.tooltip) {
      this.setInteractive(
        new Phaser.Geom.Rectangle(0, 0, 24, 21), 
        Phaser.Geom.Rectangle.Contains
      );
      this.on('pointerover', this.showTooltip);
      this.on('pointerout', this.hideTooltip);
    }
    this.scene.add.existing(this);
    this.draw();
  }
  showTooltip() {
    if (this.tooltip) {
      this.tooltipWindow = new Tooltip({
        ...this.config,
        ...{
          tooltip: this.tooltip
        }
      });
    }
  }
  hideTooltip() {
    if (this.tooltipWindow) {
      this.tooltipWindow.destroy();
    }
  }
  draw() {
    this.text = this.targetScene[this.targetActor][this.targetAttribute] +
      (this.targetAttributeMax ? this.separator + '' + this.targetScene[this.targetActor][this.targetAttributeMax] : '');
  }
}