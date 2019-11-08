class Tooltip extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x + 12,
      config.y - 11,
      config.tooltip, 
      {
        'fontFamily': config.fontFamily,
        'fontSize': config.fontSize,
        'fill': config.fill,
        'wordWrap': {
          'width': 170
        }
      }
    );
    if (this.getBottomRight().x > 360) {
      this.x -= this.width + 30;
    };
    if (this.getBottomRight().y > 570) {
      this.y -= this.height - 18;
    };
    this.scene.add.existing(this);
    this.setPadding(3, 1);
    this.setDepth(2);
    this.window = this.scene.add.graphics({
      lineStyle: {
        color: 0x000000
      },
      fillStyle: {
        alpha: 0.95,
        color: 0x404040
      }
    });
    this.window.fillRectShape(this.getBounds());
    this.window.strokeRectShape(this.getBounds());
    this.window.depth = 1;
  }
  destroy() {
    this.window.destroy();
    super.destroy();
  }
}