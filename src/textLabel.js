class TextLabel extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      config.scene,
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
    let game = config.scene.scene.get('GameScene');
    game.events.on(config.event, this.draw.bind(this));
    config.scene.add.existing(this);
    this.draw();
  }
  draw() {
    this.text = 
      player[this.value] + (this.valueMax ? '/' + player[this.valueMax] : '');
  }
}