class TextLabelStrokedBar extends TextLabelStroked {  
  constructor(config) {
    super(config);
    this.bar = this.scene.add.graphics({
      fillStyle: {
        color: config.color
      }
    });
    this.bar.fillRect(
      config.rectX, 
      config.rectY, 
      config.rectWidth, 
      config.rectHeight
    );
    this.depth += 1;
  }
}