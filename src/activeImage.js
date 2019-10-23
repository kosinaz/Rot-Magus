class ActiveImage extends Phaser.GameObjects.Image {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x,
      config.y,
      config.texture,
      config.frame
    );
    this.tooltip = config.tooltip;
    this.fontFamily = config.fontFamily;
    this.fontSize = config.fontSize;
    this.fill = config.fill;
    this.setOrigin(config.originX, config.originY);
    this.setInteractive();
    this.on('pointerover', function () {
      this.tooltipWindow = this.scene.add.graphics({
        fillStyle: {
          color: 0x404040
        }
      });
      this.tooltipWindow.fillRect(this.x + 12, this.y - 11, 240, 63);
      this.tooltipWindow.depth = 1;
      this.tooltipText = this.scene.add.text(
        this.x + 12,
        this.y - 11, 
        this.tooltip, {
          'fontFamily': this.fontFamily,
          'fontSize': this.fontSize,
          'fill': this.fill,
          'wordWrap': {
            'width': 234
          },
          "lineSpacing": 0
        }
      );
      this.tooltipText.setPadding(3,1);
      this.tooltipText.depth = 1;
    });
    this.on('pointerout', function () {
      this.tooltipWindow.destroy();
      this.tooltipText.destroy();
    });
    this.targetScene = game.scene.getScene(config.targetScene);
    this.targetScene.events.on('update', this.update.bind(this));
    this.scene.add.existing(this);
    this.update();
  }
  update() {
    
  }
}