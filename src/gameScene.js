
const scheduler = new ROT.Scheduler.Action();
const engine = new ROT.Engine(scheduler)
let map;
let heightmap;
let player;
let marker;
let enemies = [];
let engineLocked = false;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  groundLayer = {};
  itemLayer = {};
  fov = {};

  preload = function () {

    // preload the Tiled map of the random features that will be used 
    // to fill the game map with random map features
    this.load.tilemapTiledJSON('featureMap', 'data/map.json');

    // preload the tileset image that contains all the tiles of the map
    this.load.spritesheet('tilesetImage', 'assets/images/tiles.png', {
      frameWidth: 24,
      frameHeight: 21
    });
  };

  create = function () {

    // make the tilemap of features based on the preloaded Tiled map
    const features = this.make.tilemap({
      key: 'featureMap'
    });
    
    // make a blank map that will be filled with random map features
    const map = this.make.tilemap({
      tileWidth: 24,
      tileHeight: 21,
      width: 256,
      height: 256
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

    // generate a noise to use it throughout the whole procedural map generation
    const noise = new ROT.Noise.Simplex();
    
    // generate height map
    Heightmap.add(layer, noise);

    // put down the start location
    Start.put(layer, features)

    // generate rivers
    layer.forEachTile(function (tile) {

      // if there is a spring
      if (tile.properties && tile.properties.spring) {

        // put down a river
        //River.put(noise, tile.x, tile.y, layer);

      }
    });

    // generate houses
    layer.forEachTile(function (tile) {

      // if there is a floor
      if (tile.properties && tile.properties.floor) {

        // put down a house
        //House.put(noise, tile.x, tile.y, layer);
      }
    }, {
      layer: layer,
      noise: noise
    });

    // generate roads
    layer.forEachTile(function (tile) {

      // if there is a road
      if (tile.properties && tile.properties.road) {

        // put down a road
        //Road.put(noise, tile.x, tile.y, layer);
      }
    }, {
      layer: layer,
      noise: noise
    });
    
    // initially hide the whole map
    this.groundLayer.forEachTile(tile => (tile.alpha = 0));
    this.itemLayer.forEachTile(tile => (tile.alpha = 0));

    // create player at the center of the map
    player = new Actor(this, 127, 127, 'tilesetImage', 25, layer, true);
    player.name = 'Bonthar';
    layer.on('pointerdown', function (pointer, x, y) {
      player.orderTo(layer.worldToTileX(x), layer.worldToTileY(y));
    });

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
    return x === playerXY.x && y === playerXY.y ||
      tile && !tile.properties.opaque;
  }

}