class TextLabel extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      game.scene.getScene(config.guiScene),
      config.x,
      config.y,
      config.text, 
      {
        'fontFamily': config.font || 'font',
        'fontSize': config.size || '16px',
        'fill': config.fill !== undefined ? config.fill : '#000000'
      }
    );
    this.value = config.value;
    this.valueMax = config.valueMax;
    this.setOrigin(
      config.originX !== undefined ? config.originX : 0.5, 
      config.originY !== undefined ? config.originY : undefined
    );    
    this.guiScene = game.scene.getScene(config.guiScene)
    this.gameScene = game.scene.getScene(config.gameScene);
    this.gameScene.events.on(config.event, this.draw.bind(this));
    this.guiScene.add.existing(this);
    this.draw();
  }
  draw() {
    this.text = this.gameScene.player[this.value] + 
      (this.valueMax ? '/' + this.gameScene.player[this.valueMax] : '');
  }
}