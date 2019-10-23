class ActiveImage extends Phaser.GameObjects.Image {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x,
      config.y,
      config.texture,
      config.frame
    );
    this.config = config;
    this.fill = config.fill;
    this.fontFamily = config.fontFamily;
    this.fontSize = config.fontSize;
    this.targetActor = config.targetActor;
    this.targetAttribute = config.targetAttribute;
    this.targetScene = game.scene.getScene(config.targetScene);
    this.tooltip = config.tooltip;
    
    this.setOrigin(config.originX, config.originY);
    this.setInteractive();
    this.on('pointerover', function () {
      if (this.tooltip) {
        this.tooltipWindow = new Tooltip(config);
      }
    });
    this.on('pointerout', function () {
      if (this.tooltip) {
        this.tooltipWindow.destroy();
      }
    });
    this.targetScene.events.on('update', this.update.bind(this));
    this.scene.add.existing(this);
    this.update();
  }
  update() {
    
  }
}