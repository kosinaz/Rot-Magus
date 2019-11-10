class LoseScene extends Phaser.Scene {
  constructor() {
    super('LoseScene');
  }

  create() {
    let desc = game.rank + ' (' + game.score + ' xp) - slain by ' + game.killer;
    if (GJAPI.bActive) {
      GJAPI.ScoreAdd(0, game.score, desc);
    } else {
      GJAPI.ScoreAddGuest(0, game.score, desc, 'Unnamed Hero');
    }
    this.cameras.main.fadeIn(2000);
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
    this.input.on('pointerup', function () {
      this.scene.start('ScoreScene');
    }, this)
  }
}