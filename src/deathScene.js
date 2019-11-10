class DeathScene extends Phaser.Scene {
  constructor() {
    super('DeathScene');
  }

  create() {
    if (GJAPI.bActive) {
      GJAPI.ScoreAdd(0, game.score, game.score);
    } else {
      GJAPI.ScoreAddGuest(0, game.score, game.score, 'Unnamed Hero');
    }
    this.cameras.main.fadeIn(2000);
    this.cameras.main.setBackgroundColor('#000000');
    this.add.image(512, 200, 'gui', 'funeral').setOrigin(0.5);
    this.add.text(
      512, 
      250, 
      (game.username || 'Atlian') + ' is dead',
      {
        fontFamily: 'font',
        fontSize: '16px',
        fill: '#e00000'
      }
    ).setOrigin(0.5).setAlign('center');
    this.input.on('pointerup', function () {
      this.scene.start('LoseScene');
    }, this);
  }
}