class GUIScene extends Phaser.Scene {
  constructor() {
    super('GUIScene');
  }

  preload = function () {
    this.load.image('ingame', 'assets/images/gui/ingame.png');
  };
  
  create = function () {
    
    /** 
     * Show GUI background
     */
    GUIBuilder.create({
      texture: 'ingame',
      type: 'Image',
      sceneGUI: 'GUIScene',
      x: 512,
      y: 288
    });

    /**
     * Add player character image
     */
    GUIBuilder.create({
      frame: 'tileIndex',
      texture: 'tilesetImage',
      type: 'Image',
      sceneGUI: 'GUIScene',
      x: 16,
      y: 16
    });

    /**
     * Add experience level indicator
     */
    GUIBuilder.create({
      event: 'updateAttribute',
      type: 'TextLabelStroked',
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'level',
      x: 40,
      y: 16
    });

    /**
     * Add player name
     */
    this.nameLabel = new TextLabel({
      event: 'updateAttribute',
      originX: 0,
      originY: 0.5,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'name',
      x: 56,
      y: 16
    });

    /**
     * Add experience bar
     */
    this.xpBar = new TextLabelStrokedBar({
      color: 0xe30000,
      event: 'updateAttribute',
      rectHeight: 19,
      rectX: 5,
      rectY: 27,
      rectWidth: 118,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'xp',
      valueMax: 'xpMax',
      x: 64,
      y: 37
    });
    
    /**
     * Add health bar
     */
    this.healthBar = new TextLabelStrokedBar({
      color: 0x00e300,
      event: 'updateAttribute',
      rectHeight: 19,
      rectX: 5,
      rectY: 48,
      rectWidth: 118,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'health',
      valueMax: 'healthMax',
      x: 64,
      y: 58
    });

    /**
     * Add mana bar
     */
    this.manaBar = new TextLabelStrokedBar({
      color: 0x4261e7,
      event: 'updateAttribute',
      rectHeight: 19,
      rectX: 5,
      rectY: 69,
      rectWidth: 118,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'mana',
      valueMax: 'manaMax',
      x: 64,
      y: 79
    });

    /**
     * Add speed label
     */
    this.nameLabel = new TextLabel({
      event: 'updateAttribute',
      originX: 1,
      originY: 0.5,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'speed',
      x: 288,
      y: 16
    });

    /**
     * Add strength label
     */
    this.strengthLabel = new TextLabel({
      event: 'updateAttribute',
      originX: 1,
      originY: 0.5,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'load',
      valueMax: 'strength',
      x: 288,
      y: 37
    });

    /**
     * Add agility label
     */
    this.agilityLabel = new TextLabel({
      event: 'updateAttribute',
      originX: 1,
      originY: 0.5,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'agility',
      x: 288,
      y: 58
    });

    /**
     * Add wisdom label
     */
    this.wisdomLabel = new TextLabel({
      event: 'updateAttribute',
      originX: 1,
      originY: 0.5,
      sceneGame: 'GameScene',
      sceneGUI: 'GUIScene',
      value: 'wisdom',
      x: 288,
      y: 79
    });

    /**
     * Grab a reference to the Game Scene
     */
    var game = this.scene.get('GameScene');
    this.groundLayer = game.groundLayer;
    this.itemLayer = game.itemLayer;
    
    /**
     * Listen for events from it
     */
    game.events.on('playerMoved', function () {
      this.currentGround.alpha = 0;
      var topTile = this.currentGround.getTilesWithin(0, 0, 15, 10, {
        isNotEmpty: true
      })[0];
      if (topTile) {
        this.itemLayer.putTileAt(
          topTile.index,
          this.currentGround.data.x, 
          this.currentGround.data.y
        );
      } else {
        this.itemLayer.removeTileAt(
          this.currentGround.data.x,
          this.currentGround.data.y
        );
      };
      if (!this.grounds[player.tileX + ',' + player.tileY]) {
        this.grounds[player.tileX + ',' + player.tileY] = addGround(this.ground, this.groundLayer);
      }
      this.currentGround = this.grounds[player.tileX + ',' + player.tileY];
      this.currentGround.alpha = 1;
    }, this);

    /**
     * Create inventory
     */
    this.inventory = createInventory(this);
    this.inventory.putTileAt(116, 0, 5);
    this.inventory.putTileAt(118, 1, 5);
    this.inventory.putTileAt(108, 2, 5);
    this.inventory.putTileAt(102, 3, 5);

    this.ground = createGround(this);
    this.grounds = {};
    this.grounds[player.tileX + ',' + player.tileY] = addGround(this.ground, this.groundLayer);
    this.currentGround = this.grounds[player.tileX + ',' + player.tileY];
  };

  update = function () {

    var x, y, tileXY;

    /**
     * Ignore world input
     */
    if (this.input.activePointer.x > 370) {
      return;
    }
    
    x = this.input.activePointer.x;
    y = this.input.activePointer.y;

    /**
     * If the player clicked
     */
    if (this.input.activePointer.justDown) {
      tileXY = this.inventory.worldToTileXY(x, y);      
      if (tileXY.y < 4) {
        
        /**
         * If the player clicked on the equipment
         */
        if (tileXY.x === 7 && tileXY.y === 0) {

          /**
           * If the player clicked on the helmet
           */
          this.pickUpOrPutDownType('helmet', tileXY, x, y);
        } else if (tileXY.x === 7 && tileXY.y === 1) {

          /**
           * If the player clicked on the necklace
           */
          this.pickUpOrPutDownType('necklace', tileXY, x, y);
        } else if (tileXY.x === 6 && tileXY.y === 2) {

          /**
           * If the player clicked on the ring
           */
          this.pickUpOrPutDownType('ring', tileXY, x, y);
        } else if (tileXY.x === 7 && tileXY.y === 2) {

          /**
           * If the player clicked on the cloak
           */
          this.pickUpOrPutDownType('cloak', tileXY, x, y);
        } else if (tileXY.x === 8 && tileXY.y === 2) {

          /**
           * If the player clicked on the gloves
           */
          this.pickUpOrPutDownType('gloves', tileXY, x, y);
        } else if (tileXY.x === 6 && tileXY.y === 3) {

          /**
           * If the player clicked on the weapon
           */
          this.pickUpOrPutDownType('weapon', tileXY, x, y);
        } else if (tileXY.x === 7 && tileXY.y === 3) {

          /**
           * If the player clicked on the armor
           */
          this.pickUpOrPutDownType('armor', tileXY, x, y);
          
        } else if (tileXY.x === 8 && tileXY.y === 3) {

          /**
           * If the player clicked on the shield
           */
          this.pickUpOrPutDownType('shield', tileXY, x, y);
        }         
      } else if (tileXY.x > -1 && tileXY.x < 15) {
        if (tileXY.y > 4 && tileXY.y < 15) {

          /**
           * If the player clicked on the inventory
           */
          this.pickUpOrPutDown(this.inventory, tileXY, x, y);
        } else if (tileXY.y > 15 && tileXY.y < 26) {
          tileXY.y -= 16;

          /**
           * If the player clicked on the ground
           */
          this.pickUpOrPutDown(this.currentGround, tileXY, x, y - 16);
        }
      }
    }

    /**
     * Move the held item to the pointer
     */
    if (this.hold) {
      this.hold.x = x;
      this.hold.y = y;
    }
    
  };

  isHolding = function (requiredItemType) {
    var heldItemType = '';
    if (!this.hold) {
      return;
    }
    switch (this.hold.frame.name) {
      case 100: heldItemType = 'weapon'; break;
      case 101: heldItemType = 'armor'; break;
      case 102: heldItemType = ''; break;
      case 103: heldItemType = 'weapon'; break;
      case 104: heldItemType = 'helmet'; break;
      case 105: heldItemType = 'shield'; break;
      case 106: heldItemType = 'weapon'; break;
      case 107: heldItemType = 'weapon'; break;
      case 108: heldItemType = 'weapon'; break;
      case 109: heldItemType = ''; break;
      case 110: heldItemType = ''; break;
      case 111: heldItemType = 'armor'; break;
      case 112: heldItemType = 'weapon'; break;
      case 113: heldItemType = 'cloak'; break;
      case 114: heldItemType = 'weapon'; break;
      case 115: heldItemType = 'weapon'; break;
      case 116: heldItemType = 'weapon'; break;
      case 117: heldItemType = 'weapon'; break;
      case 118: heldItemType = 'cloak'; break;
      case 119: heldItemType = 'necklace'; break;
      case 120: heldItemType = 'ring'; break;
      case 121: heldItemType = 'shield'; break;
      case 122: heldItemType = 'weapon'; break;
      case 123: heldItemType = 'gloves'; break;
      case 124: heldItemType = 'weapon'; break;
      case 125: heldItemType = 'gloves'; break;
      case 126: heldItemType = 'helmet'; break;
      case 127: heldItemType = 'armor'; break;
      case 128: heldItemType = ''; break;
      case 129: heldItemType = 'necklace'; break;
      case 130: heldItemType = 'ring'; break;
      case 131: heldItemType = 'weapon'; break;
      case 132: heldItemType = 'cloak'; break;
      case 133: heldItemType = 'shield'; break;
      case 134: heldItemType = 'weapon'; break;
      case 135: heldItemType = 'weapon'; break;
      case 136: heldItemType = 'weapon'; break;
      case 137: heldItemType = 'weapon'; break;
      case 138: heldItemType = 'armor'; break;
      case 139: heldItemType = 'weapon'; break;
      case 140: heldItemType = 'armor'; break;
      case 141: heldItemType = 'weapon'; break;
      case 142: heldItemType = 'gloves'; break;
      case 143: heldItemType = 'helmet'; break;
      case 144: heldItemType = 'shield'; break;
      case 145: heldItemType = 'weapon'; break;
      case 146: heldItemType = 'weapon'; break;
      case 147: heldItemType = 'necklace'; break;
      case 148: heldItemType = 'weapon'; break;
      case 149: heldItemType = 'shield'; break;
    }
    return heldItemType === requiredItemType;
  };

  pickUpOrPutDownType = function (itemType, tileXY, x, y) {
    if (this.hold) {
      if (this.isHolding(itemType)) {

        /**
         * If the player holds someting put it down or switch it
         */
        this.pickUpOrPutDown(this.inventory, tileXY, x, y);
      }
    } else {

      /** 
       * If the player does not hold anything pick up if there is
       * something 
       */
      this.pickUp(this.inventory, tileXY, x, y);
    }
  };

  pickUpOrPutDown = function (layer, tileXY, x, y) {
    var tile = layer.getTileAt(tileXY.x, tileXY.y);
    if (this.hold) {

      /**
       * If the player holds something
       */
      var heldItem = this.hold.frame.name;
      this.hold.destroy();
      if (tile) {

        /**
         * If there is an item there pick up
         */
        this.hold = this.add.image(x, y, 'tilesetImage', tile.index);
      }
      else {

        /**
         * If there is no item there remove the already held one
         */
        this.hold = null;
      }

      /**
       * Put down the already held item
       */
      layer.putTileAt(heldItem, tileXY.x, tileXY.y);
    }
    else {

      /** 
       * If the player does not hold anything pick up if there is something 
       */
      this.pickUp(layer, tileXY, x, y);
    }
  };
  
  pickUp = function (layer, tileXY, x, y) {
    var tile = layer.getTileAt(tileXY.x, tileXY.y);
    if (tile) {

      /**
       * If the player does not hold anything pick up the item
       */
      this.hold = this.add.image(x, y, 'tilesetImage', tile.index);
      layer.removeTileAt(tileXY.x, tileXY.y);
    }
  };
};

/**
 * Create the inventory of the player
 * @param {*} scene 
 */
function createInventory(scene) {
  var map = scene.make.tilemap({
    tileWidth: 24,
    tileHeight: 21,
    width: 15,
    height: 15
  });
  return map.createBlankDynamicLayer(
    'inventory', 
    map.addTilesetImage('tilesetImage'),
    4, 
    5
  );
}

/**
 * Create the collection of items on the ground
 * @param {*} scene 
 */
function createGround(scene) {
  return scene.make.tilemap({
    tileWidth: 24,
    tileHeight: 21,
    width: 15,
    height: 10
  });
}

function addGround(map, groundLayer) {
  var layer = map.createBlankDynamicLayer(
    'ground ' + player.tileX + ',' + player.tileY,
    map.addTilesetImage('tilesetImage'),
    4,
    341
  );
  layer.data = {
    x: player.tileX, 
    y: player.tileY
  };
  return layer;
}