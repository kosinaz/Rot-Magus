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
let player;
let controls;

function preload() {
  this.load.spritesheet("tiles", "assets/images/tiles.png", {
    frameWidth: 24,
    frameHeight: 21
  });
  this.load.tilemapTiledJSON("map", "data/map.json");
}

function create() {
  const map = this.make.tilemap({
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
  map.createStaticLayer("tiles", tileset, 0, 0);

  /**
   * Create player
   */
  const start = map.findObject("objects", obj => obj.name === "player");
  player = this.add.sprite(start.x, start.y, "tiles", 25);
  player.setOrigin(0);

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

  /**
   * Convert the mouse position to world position within the camera
   */
  const worldPoint = 
    this.input.activePointer.positionToCamera(this.cameras.main);

  /**
   * Move the player towards the mouse
   */  
  if (this.input.manager.activePointer.justDown) {
    if (worldPoint.x > player.x + 24) {
      player.x += 24;
    } else if (worldPoint.x < player.x) {
      player.x -= 24;
    }
    if (worldPoint.y > player.y + 24) {
      player.y += 21;
    } else if (worldPoint.y < player.y) {
      player.y -= 21;
    }
  }
}