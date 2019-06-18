class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  create() {
    this.add.text(512, 100, 'ROT MAGUS', {
      fontFamily: 'font',
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    new TextButton({
      onPointerUp: function () {
        this.scene.start('GameScene');
        this.scene.start('GUIScene');
        this.scene.stop('InfiniteScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Start game',
      x: 512,
      y: 200
    });
  }
}