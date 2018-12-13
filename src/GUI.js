GUIScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function GUIScene() {
      Phaser.Scene.call(this, {
        key: 'GUIScene',
        active: true
      });
      this.inventory;
      this.hold;
    },

  preload: function () {
    this.load.image('ingame', 'assets/images/gui/ingame.png');
  },
  
  create: function () {
    
    /** 
     * Show GUI background
     */
    this.add.image(512, 288, 'ingame');

    /**
     * Add player character image
     */
    this.add.image(16, 16, "tiles", 25);

    /**
     * Add experience level indicator
     */
    this.levelLabel = this.add.text(40, 16, '0', {
      fontFamily: 'Rhythmus',
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.levelLabel.setStroke('#000000', 3);
    this.levelLabel.setOrigin(0.5);

    /**
     * Add player name
     */
    this.nameLabel = this.add.text(56, 16, 'Bonthar', {
      fontFamily: 'Rhythmus',
      fontSize: '16px',
      fill: '#000000'
    });
    this.nameLabel.setOrigin(0, 0.5);

    /**
     * Add experience bar
     */
    this.XPBar = this.add.graphics({
      fillStyle: {
        color: 0xe30000
      }
    });
    this.XPBar.fillRectShape(new Phaser.Geom.Rectangle(5, 27, 1, 19));
    this.XPLabel = this.add.text(64, 37, '0/50', {
      fontFamily: 'Rhythmus',
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.XPLabel.setStroke('#000000', 3);
    this.XPLabel.setOrigin(0.5);
    
    /**
     * Add health bar
     */
    this.healthBar = this.add.graphics({
      fillStyle: {
        color: 0x00e300
      }
    });
    this.healthBar.fillRectShape(new Phaser.Geom.Rectangle(5, 48, 118, 19));
    this.healthLabel = this.add.text(64, 58, '120/120', {
      fontFamily: 'Rhythmus',
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.healthLabel.setStroke('#000000', 3);
    this.healthLabel.setOrigin(0.5);

    /**
     * Add mana bar
     */
    this.manaBar = this.add.graphics({
      fillStyle: {
        color: 0x4261e7
      }
    });
    this.manaBar.fillRectShape(new Phaser.Geom.Rectangle(5, 69, 118, 19));
    this.manaLabel = this.add.text(64, 79, '10/10', {
      fontFamily: 'Rhythmus',
      fontSize: '14px',
      fill: '#ffffff'
    });
    this.manaLabel.setStroke('#000000', 3);
    this.manaLabel.setOrigin(0.5);

    /**
     * Add speed label
     */
    this.speedLabel = this.add.text(288, 16, '4', {
      fontFamily: 'Rhythmus',
      fontSize: '16px',
      fill: '#000000'
    });
    this.speedLabel.setOrigin(1, 0.5);

    /**
     * Add strength label
     */
    this.speedLabel = this.add.text(288, 37, '12/17', {
      fontFamily: 'Rhythmus',
      fontSize: '16px',
      fill: '#000000'
    });
    this.speedLabel.setOrigin(1, 0.5);

    /**
     * Add skill label
     */
    this.skillLabel = this.add.text(288, 58, '15', {
      fontFamily: 'Rhythmus',
      fontSize: '16px',
      fill: '#000000'
    });
    this.skillLabel.setOrigin(1, 0.5);

    /**
     * Add wisdom label
     */
    this.wisdomLabel = this.add.text(288, 79, '1', {
      fontFamily: 'Rhythmus',
      fontSize: '16px',
      fill: '#000000'
    });
    this.wisdomLabel.setOrigin(1, 0.5);
    
    /**
     * Create inventory
     */
    this.inventory = createInventory(this);
    this.inventory.putTileAt(108, 0, 0);
    this.inventory.putTileAt(102, 1, 0);

    /**
     * Grab a reference to the Game Scene
     */
    var game = this.scene.get('GameScene');

    /**
     * Listen for events from it
     */
    game.events.on('specificEvent', function () {

    }, this);
  },

  update: function () {

    var x, y, tile, tileXY;

    /**
     * Ignore world input
     */
    if (this.input.activePointer.x > 370) {
      return;
    }
    
    x = this.input.activePointer.x;
    y = this.input.activePointer.y;
    if (this.input.activePointer.justDown) {
      tileXY = this.inventory.worldToTileXY(x, y);
      tile = this.inventory.getTileAt(tileXY.x, tileXY.y);
      if (tile) {
        if (!this.hold) {
          this.hold = this.add.image(x, y, "tiles", tile.index);
          this.inventory.removeTileAt(tileXY.x, tileXY.y);
        } 
      } else if (this.hold) {
        this.inventory.putTileAt(this.hold.frame.name, tileXY.x, tileXY.y);
        this.hold.destroy();
        this.hold = null;
      }
    }

    if (this.hold) {
      this.hold.x = x;
      this.hold.y = y;
    }
    
  }

});

/**
 * Create the inventory of the player
 * @param {*} scene 
 */
function createInventory(scene) {
  var map = scene.make.tilemap({
    tileWidth: 24,
    tileHeight: 21,
    width: 15,
    height: 10
  });
  return map.createBlankDynamicLayer(
    'inventory', 
    map.addTilesetImage('tiles'), 
    4, 
    110
  );
}
