class TextLabel extends Phaser.GameObjects.Text {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x,
      config.y,
      config.text, 
      {
        'fontFamily': config.fontFamily,
        'fontSize': config.fontSize,
        'fill': config.fill
      }
    );
    this.config = config;
    this.targetActor = config.targetActor;
    this.targetAttribute = config.targetAttribute;
    this.targetAttributeMax = config.targetAttributeMax;
    this.setOrigin(
      config.originX !== undefined ? config.originX : 0.5, 
      config.originY !== undefined ? config.originY : undefined
    );    
    this.targetScene = game.scene.getScene(config.targetScene);
    this.targetScene.events.on(config.event, this.draw.bind(this));
    this.scene.add.existing(this);
    this.draw();
  }
  draw() {
    this.text = this.targetScene[this.targetActor][this.targetAttribute] +
      (this.targetAttributeMax ? '/' + this.targetScene[this.targetActor][this.targetAttributeMax] : '');
  }
}