const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  parent: "game-container",
  pixelArt: true,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);
let map;
let player;
let marker;
let layer;

function preload() {
  this.load.spritesheet("tiles", "assets/images/tiles.png", {
    frameWidth: 24,
    frameHeight: 21
  });
  this.load.tilemapTiledJSON("map", "data/map.json");
}

function create() {

  map = this.make.tilemap({
    key: "map"
  });

  /** 
   * Parameters are the name of the tileset in Tiled and then the key of the
   * tileset image in Phaser's cache (i.e. the name used in preload)
   */
  const tileset = map.addTilesetImage("tiles", "tiles");

  /**
   * Parameters: layer name (or index) from Tiled, tileset, x, y
   */
  layer = map.createStaticLayer("tiles", tileset, 0, 0);

  /**
   * Create player
   */
  const start = map.findObject("objects", obj => obj.name === "player");
  player = this.add.sprite(start.x, start.y, "tiles", 25);
  player.setOrigin(0);

  /**
   * Create pointer marker
   */
  marker = this.add.graphics();
  marker.lineStyle(1, 0xffff00, 1);
  marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

  /**
   * The default camera
   */
  const camera = this.cameras.main;
  camera.startFollow(player);

  /**
   * Constrain the camera so that it isn't allowed to move outside the
   * width/height of tilemap
   */
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
}

function update() {

  var x, y, tile;

  /**
   * Convert the mouse position to world position within the camera
   */
  const worldPoint = 
    this.input.activePointer.positionToCamera(this.cameras.main);

  /**
   * Define the next position of the player based on the position of the pointer
   */
  x = player.x;
  y = player.y;
  if (worldPoint.x > player.x + 24) {
    x += 24;
  } else if (worldPoint.x < player.x) {
    x -= 24;
  }
  if (worldPoint.y > player.y + 21) {
    y += 21;
  } else if (worldPoint.y < player.y) {
    y -= 21;
  }
  
  /**
   * Move the pointer marker to the next position
   */
  marker.x = x;
  marker.y = y;

  /**
   * Check if the next position if passable
   */
  tile = layer.getTileAtWorldXY(x, y);
  if (!tile.properties.unpassable) {

    /** If passable turn the pointer yellow */
    marker.lineStyle(1, 0xffff00, 1);
    marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

    /**
     * Check if the player clicked
     */
    if (this.input.manager.activePointer.justDown) {

      /**
       * Move the player towards the pointer
       */
      player.x = x;
      player.y = y;
    }
  } else {

    /**
     * If unpassable turn the pointer grey
     */
    marker.lineStyle(1, 0x888888, 1);
    marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
  }
}