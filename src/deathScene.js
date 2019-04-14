class DeathScene extends Phaser.Scene {
  constructor() {
    super('DeathScene');
  }

  create = function () {
    this.add.text(700, 250, 'The Dark One smiles...', {
      fontFamily: 'font',
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }
};