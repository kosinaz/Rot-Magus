class Tooltip extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x + 12,
      config.y - 11,
      config.tooltip, {
        'fontFamily': config.fontFamily,
        'fontSize': config.fontSize,
        'fill': config.fill,
        'wordWrap': {
          'width': 234
        }
      }
    );
    this.scene.add.existing(this);
    this.setPadding(3, 1);
    this.setDepth(2);
    this.window = this.scene.add.graphics({
      lineStyle: {
        color: 0x000000
      },
      fillStyle: {
        color: 0x404040
      }
    });
    this.window.strokeRect(this.x + 1, this.y, 239, 62);
    this.window.fillRect(this.x + 1, this.y + 1, 238, 61);
    this.window.depth = 1;
  }
  destroy() {
    this.window.destroy();
    super.destroy();
  }
}