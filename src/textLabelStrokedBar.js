class TextLabelStrokedBar extends TextLabelStroked {  
  constructor(config) {
    super(config);
    this.rectX = config.rectX;
    this.rectY = config.rectY;
    this.rectWidth = config.rectWidth;
    this.rectHeight = config.rectHeight;
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
      this.rectY + 0.5,
      this.rectX + this.rectWidth - 1,
      this.rectY + 0.5
    );

    // Left line.
    this.bar.lineBetween(
      this.rectX + 0.5,
      this.rectY + 1,
      this.rectX + 0.5,
      this.rectY + this.rectHeight - 1
    );
    this.bar.lineStyle(1, 0x808080, 1);

    // Bottom line.
    this.bar.lineBetween(
      this.rectX + 1, 
      this.rectY + this.rectHeight - 0.5, 
      this.rectX + this.rectWidth - 1, 
      this.rectY + this.rectHeight - 0.5
    );

    // Right line.
    this.bar.lineBetween(
      this.rectX + this.rectWidth - 0.5, 
      this.rectY + 1, 
      this.rectX + this.rectWidth - 0.5, 
      this.rectY + this.rectHeight - 1
    );   

    // Bar.
    this.bar.fillRect(
      this.rectX + 1,
      this.rectY + 1,
      Math.max(
        1, 
        (this.rectWidth - 2) * 
        this.targetScene[this.targetActor][this.targetAttribute] / 
        this.targetScene[this.targetActor][this.targetAttributeMax]
      ),
      this.rectHeight - 2
    ); 
    
    // Bottom-right corner.
    this.bar.fillStyle(0xe0e0e0);
    this.bar.fillPoint(
      this.rectX + this.rectWidth - 1,
      this.rectY + this.rectHeight - 1
    );
  }
}