const scheduler = new ROT.Scheduler.Action();
const engine = new ROT.Engine(scheduler)
let map;
let heightmap;
let player;
let marker;
let enemies = [];
let engineLocked = false;
let isAcceptingOrders = false;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  groundLayer = {};
  itemLayer = {};
  fov = {};

  preload = function () {

    // preload the tileset image that contains all the tiles of the map
    this.load.spritesheet('tilesetImage', 'assets/images/tiles.png', {
      frameWidth: 24,
      frameHeight: 21
    });
  };

  create = function () {

    this.cameras.main.setBackgroundColor('#000000');
    
    // make a blank map that will be filled with random map features
    const map = this.make.tilemap({
      tileWidth: 24,
      tileHeight: 21,
      width: 81,
      height: 81
    });

    // add a tileset to the game map based on the preloaded tileset image
    const tilemap = map.addTilesetImage('tilesetImage');

    // create a blank ground layer that will be filled with random map features
    this.groundLayer = map.createBlankDynamicLayer('tiles', tilemap);
    let layer = this.groundLayer;
    layer.setInteractive();

    // create a blank item layer to show items on top of the ground layer
    this.itemLayer = map.createBlankDynamicLayer('items', tilemap);

    // create a FOV calculator
    this.fov = new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this));

    // generate a map based on simplex noise
    this.noiseMap = new SimplexMap;

    // create player at the center of the map
    let grassTiles = layer.filterTiles(function (tile) {
      return !this.noiseMap.getTileIndexAt(tile.x, tile.y);
    }, this);
    let tile = ROT.RNG.getItem(grassTiles);
    player = new Actor(this, tile.x, tile.y, 'tilesetImage', 37, layer, true);
    player.name = 'Aian';
    player.walksOn = [13, 16];
    layer.on('pointerdown', function (pointer, x, y) {
      player.orderTo(layer.worldToTileX(x), layer.worldToTileY(y));
    });
    
    // create zombies
    for (let i = 0; i < 10; i += 1) {
      tile = ROT.RNG.getItem(grassTiles);
      let enemy = new Actor(this, tile.x, tile.y, 'tilesetImage', 50, layer);
      enemy.maxHealth = 40;
      enemy.health = 40;
      enemy.speed = 4;
      enemy.name = 'Zombie ' + (i + 1);
      enemies.push(enemy); 
    }

    // create pointer marker
    marker = this.add.graphics();
    marker.lineStyle(1, 0xffff00, 1);
    marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

    // set the default camera
    const camera = this.cameras.main;
    camera.setPosition(372, 5);
    camera.setSize(648, 567);

    // constrain the camera within the width and height of the map
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    engine.start();

    this.events.on('playerDied', function () {
      this.scene.start('DeathScene');
    }.bind(this));
  };

  update = function () {

    var x, y;

    // ignore GUI input
    if (this.input.activePointer.x < 372) {
      return;
    }

    // convert the mouse position to world position within the camera
    const worldPoint =
      this.input.activePointer.positionToCamera(this.cameras.main);

    // define the target of the player based on the position of the pointer
    x = worldPoint.x - worldPoint.x % 24;
    y = worldPoint.y - worldPoint.y % 21;

    // move the pointer marker to the next position
    marker.x = x;
    marker.y = y;

  };

  isTransparent = function (x, y) {
    var playerXY, tile;

    /**
     * Return true if the position is the player's position or if it is not opaque
     */
    playerXY = this.groundLayer.worldToTileXY(player.x, player.y);
    tile = this.groundLayer.getTileAt(x, y);
    if (!tile) {
      tile = this.groundLayer.putTileAt(this.noiseMap.getTileIndexAt(x, y), x, y);
    }
    return (x === playerXY.x && y === playerXY.y)
      || tile && (tile.index !== 16 && tile.index !== 17 && tile.index !== 21);
  };
  
}