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
    this.add.bitmapText(100, 100, 'font', 'New game');
  }
}