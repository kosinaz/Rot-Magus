class TextLabel extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      game.scene.getScene(config.sceneGUI),
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
    this.sceneGUI = game.scene.getScene(config.sceneGUI)
    this.sceneGame = game.scene.getScene(config.sceneGame);
    this.sceneGame.events.on(config.event, this.draw.bind(this));
    this.sceneGUI.add.existing(this);
    this.draw();
  }
  draw() {
    this.text = 
      player[this.value] + (this.valueMax ? '/' + player[this.valueMax] : '');
  }
}