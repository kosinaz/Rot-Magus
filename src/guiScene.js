class GUIScene extends Phaser.Scene {
  constructor() {
    super('GUIScene');
  }
  
  create = function () {

    let guiElements = this.cache.json.get('guiElements');
    GUIBuilder.init(guiElements.default);
    for (let i in guiElements) {
      if (guiElements.hasOwnProperty(i)) {
        GUIBuilder.create(guiElements[i]);
      }
    }
    
    // Set the background black, the color of currently invisible areas.
    this.cameras.main.setBackgroundColor('#616161');
    
    /**
     * Grab a reference to the Game Scene
     */
    this.gameScene = this.scene.get('GameScene');
    
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
        this.grounds[player.tileX + ',' + player.tileY] = addGround(this.ground, player.tileX, player.tileY);
      }
      this.currentGround = this.grounds[player.tileX + ',' + player.tileY];
      this.currentGround.alpha = 1;
    }, this);

    /**
     * Create inventory
     */
    this.itemTypes = this.cache.json.get('itemTypes');
    this.gameScene.player.inventory.forEach(function (tileName, i) {
      new Item(this, 16 + i * 24, 121, 'tiles', tileName);
    }.bind(this));
    this.input.on('dragstart', function (pointer, item) {
      this.children.bringToTop(item);
    }, this);
    this.input.on('drag', function (pointer, item, x, y) {
      item.x = x;
      item.y = y;
    });
    this.input.on('drop', function (pointer, item, dropZone) {
      if (dropZone.frame.name === item.config.equips
        || dropZone.frame.name === 'socket') {
        item.x = dropZone.x;
        item.y = dropZone.y;
      } else {
        item.x = item.input.dragStartX;
        item.y = item.input.dragStartY;
        dropZone.setTint(0xffffff);
      }
    });
    this.input.on('dragend', function (pointer, item, dropped) {
      if (!dropped) {
        item.x = item.input.dragStartX;
        item.y = item.input.dragStartY;
      }
    });
    // this.inventory = createInventory(this);
    // this.inventory.putTileAt('bow', 0, 5);
    // this.inventory.putTileAt('arrow', 1, 5);
    // this.inventory.putTileAt('dagger', 2, 5);
    // this.inventory.putTileAt('elvenCloak', 3, 5);

    // this.ground = createGround(this);
    // this.grounds = {};
    // this.grounds[this.gameScene.player.tileX + ',' + this.gameScene.player.tileY] = addGround(this.ground, this.gameScene.player.tileX, this.gameScene.player.tileY);
    // this.currentGround = this.grounds[this.gameScene.player.tileX + ',' + this.gameScene.player.tileY];

    // for (let i = 0; i < 50; i += 1) {
    //   let tile = ROT.RNG.getItem(game.grassTiles);
    //   let ground = createGround(this);
    //   let tileIndex = ROT.RNG.getUniformInt(100, 149);
    //   this.grounds[tile.x + ',' + tile.y] = addGround(ground, tile.x, tile.y);
    //   this.grounds[tile.x + ',' + tile.y].putTileAt(tileIndex, 0, 5);
    //   this.grounds[tile.x + ',' + tile.y].alpha = 0;
    //   this.itemLayer.putTileAt(tileIndex, tile.x, tile.y);
    // }
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
        this.hold = this.add.image(x, y, 'tiles', tile.index);
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
      this.hold = this.add.image(x, y, 'tiles', tile.index);
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
    map.addTilesetImage('tiles'),
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

function addGround(map, tileX, tileY) {
  var layer = map.createBlankDynamicLayer(
    'ground ' + tileX + ',' + tileY,
    map.addTilesetImage('tiles'),
    4,
    341
  );
  layer.data = {
    x: tileX, 
    y: tileY
  };
  return layer;
}