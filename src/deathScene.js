class DeathScene extends Phaser.Scene {
  constructor() {
    super('DeathScene');
  }

  create = function () {
    this.cameras.main.setBackgroundColor('#000000');
    this.add.text(500, 250, 'The Dark One smiles...', {
      fontFamily: 'font',
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }
};