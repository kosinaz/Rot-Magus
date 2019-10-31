class DeathScene extends Phaser.Scene {
  constructor() {
    super('DeathScene');
  }

  create = function () {
    this.cameras.main.setBackgroundColor('#000000');
    this.add.text(
      512, 
      250, 
      'You died as a level ' + game.score + ' hero.\n\nThe Dark One smiles...',
      {
        fontFamily: 'font',
        fontSize: '20px',
        fill: '#ffffff'
      }
    ).setOrigin(0.5);

    if (GJAPI.bActive) {
      GJAPI.ScoreAdd(0, game.score, game.score);
    } else {
      GJAPI.ScoreAddGuest(0, game.score, game.score, 'Unnamed Hero');
    }
  }
}