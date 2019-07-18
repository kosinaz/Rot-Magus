class GUIScene extends Phaser.Scene {
  constructor() {
    super('GUIScene');
  }
  
  create = function () {

    let guiElements = this.cache.json.get('guiElements');
    this.gui = {};
    GUIBuilder.init(guiElements.default);
    for (let i in guiElements) {
      if (guiElements.hasOwnProperty(i)) {
        this.gui[i] = GUIBuilder.create(guiElements[i]);
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
    this.gameScene.events.on('playerMoved', function () {
      if (!this.ground) {
        return;
      }
      console.log('moved');
      this.gui.inventory.forEach(function () {

      })
      console.log(this.ground);
      let topItem = this.ground.filter(slot => slot !== null)[0];
      console.log(topItem);
      if (topItem) {
        this.gameScene.map.addItem(
          this.gameScene.player.tileX, 
          this.gameScene.player.tileY,
          topItem
        );
      } else {
        this.gameScene.map.removeItem(
          this.gameScene.player.tileX,
          this.gameScene.player.tileY
        );
      };
    }, this);

    /**
     * Create inventory
     */
    this.itemTypes = this.cache.json.get('itemTypes');
    this.gameScene.player.inventory.forEach(function (tileName, i) {
      this.gui.inventory[i].item = new Item(
        this, 
        this.gui.inventory[i].x, 
        this.gui.inventory[i].y, 
        'tiles', 
        tileName
      );
    }.bind(this));

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