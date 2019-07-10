class TextLabel extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x,
      config.y,
      config.text, 
      {
        'fontFamily': config.font || 'font',
        'fontSize': config.size || '16px',
        'fill': config.fill !== undefined ? config.fill : '#000000'
      }
    );
    this.target = config.target;
    this.value = config.value;
    this.valueMax = config.valueMax;
    this.setOrigin(
      config.originX !== undefined ? config.originX : 0.5, 
      config.originY !== undefined ? config.originY : undefined
    );    
    this.sourceScene = game.scene.getScene(config.sourceScene);
    this.sourceScene.events.on(config.event, this.draw.bind(this));
    this.scene.add.existing(this);
    this.draw();
  }
  draw() {
    this.text = this.sourceScene[this.target][this.value] +
      (this.valueMax ? '/' + this.sourceScene[this.target][this.valueMax] : '');
  }
}