GUIScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function GUIScene() {
      Phaser.Scene.call(this, {
        key: 'GUIScene',
        active: true
      });
    },

  preload: function () {
    this.load.image('ingame', 'assets/images/gui/ingame.png');
  },
  
  create: function () {
    
    this.add.image(512, 288, 'ingame');
    
    //  Grab a reference to the Game Scene
    var game = this.scene.get('GameScene');

    //  Listen for events from it
    game.events.on('specificEvent', function () {

    }, this);
  }

});