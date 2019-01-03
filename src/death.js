DeathScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function DeathScene() {
      Phaser.Scene.call(this, {
        key: 'DeathScene'
      });
    },

  preload: function () {
    
  },
  create: function () {
    this.add.text(700, 250, 'The Dark One smiles...', {
      fontFamily: 'Rhythmus',
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  },
  update: function () {
    
  }
});