class TextLabelStrokedBar extends TextLabelStroked {  
  constructor(config) {
    super(config);
    this.rectX = config.rectX;
    this.rectY = config.rectY;
    this.rectWidth = config.rectWidth;
    this.rectHeight = config.rectHeight;
    this.targetAttribute = config.targetAttribute;
    this.targetAttributeMax = config.targetAttributeMax;
    this.bar = this.scene.add.graphics({
      fillStyle: {
        color: config.color
      }
    });
    this.depth = 1;
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
    this.bar.lineStyle(1, 0x404040, 1);

    // Top line.
    this.bar.lineBetween(
      this.rectX,
      this.rectY,
      this.rectX + this.rectWidth - 1,
      this.rectY
    );

    // Left line.
    this.bar.lineBetween(
      this.rectX + 1,
      this.rectY + 1,
      this.rectX + 1,
      this.rectY + this.rectHeight - 1
    );
    this.bar.lineStyle(1, 0x808080, 1);

    // Bottom line.
    this.bar.lineBetween(
      this.rectX + 1, 
      this.rectY + this.rectHeight - 1, 
      this.rectX + this.rectWidth - 1, 
      this.rectY + this.rectHeight - 1
    );

    // Right line.
    this.bar.lineBetween(
      this.rectX + this.rectWidth, 
      this.rectY + 1, 
      this.rectX + this.rectWidth, 
      this.rectY + this.rectHeight - 1
    );
    this.bar.lineStyle(1, 0xe0e0e0, 1);

    // Bottom-right corner.
    this.bar.lineBetween(
      this.rectX + this.rectWidth,
      this.rectY + this.rectHeight - 1,
      this.rectX + this.rectWidth,
      this.rectY + this.rectHeight
    );

    // Bar.
    this.bar.fillRect(
      this.rectX + 1,
      this.rectY + 1,
      Math.max(
        1, 
        (this.rectWidth - 2) * 
        this.sourceScene[this.target][this.targetAttribute] / 
        this.sourceScene[this.target][this.targetAttributeMax]
      ),
      this.rectHeight - 2
    );
  }
}