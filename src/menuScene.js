class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.bitmapFont(
      'font',
      'assets/fonts/bitmap/rhythmus.png',
      'assets/fonts/bitmap/rhythmus.xml'
    );
  }

  create() {
    this.add.existing(new BitmapTextButton({
      font: 'font',
      onPointerUp: function () {
        this.scene.start('GameScene');
        this.scene.start('GUIScene');
      }.bind(this),
      origin: 0,
      scene: this,
      size: 64,
      text: 'New game',
      x: 100,
      y: 100
    }));
  }
}