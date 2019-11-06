class LoseScene extends Phaser.Scene {
  constructor() {
    super('LoseScene');
  }

  create() {
    //this.cameras.main.fadeIn(2000);
    this.cameras.main.setBackgroundColor('#000000');
    this.add.image(512, 200, 'gui', 'loseHehehe').setOrigin(0.5);
    this.add.text(
      512,
      250,
      'The Dark One smiles...\nHe-he-he', 
      {
        fontFamily: 'font',
        fontSize: '16px',
        fill: '#ffffff'
      }
    ).setOrigin(0.5).setAlign('center');
    this.input.on('pointerdown', function () {
      this.scene.start('ScoreScene');
    }, this)
  }
}