class TextLabelStrokedBar extends TextLabelStroked {  
  constructor(config) {
    super(config);
    this.rectX = config.rectX;
    this.rectY = config.rectY;
    this.rectWidth = config.rectWidth;
    this.rectHeight = config.rectHeight;
    this.value = config.value;
    this.valueMax = config.valueMax;
    this.bar = this.scene.add.graphics({
      fillStyle: {
        color: config.color
      }
    });
    this.depth += 1;
    this.drawBar();
  }
  draw() {
    super.draw();
    if (this.bar) {
      this.drawBar();
    }
  }
  drawBar() {
    this.bar.clear();
    this.bar.fillRect(
      this.rectX,
      this.rectY,
      Math.max(1, this.rectWidth * this.gameScene.player[this.value] / this.gameScene.player[this.valueMax]),
      this.rectHeight
    );
  }
}