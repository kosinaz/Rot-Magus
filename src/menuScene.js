class MenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'MenuScene',
      active: true
    });
  }
  create() {

    let title = this.add.text(512, 100, 'ROT MAGUS', {
      fontFamily: 'font',
      fontSize: '64px',
      fill: '#ff0000'
    });
    title.setStroke('#000000', 8);
    title.setOrigin(0.5);

    let button = this.add.existing(new TextButton({
      onPointerUp: function () {
        this.scene.start('GameScene');
        this.scene.start('GUIScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Start game',
      x: 512,
      y: 200
    }));
    button.setFill('#ffff00');
    button.setStroke('#000000', 6);
  }
}