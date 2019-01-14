
const scheduler = new ROT.Scheduler.Action();
const engine = new ROT.Engine(scheduler)
let map;
let heightmap;
let player;
let marker;
let enemies = [];
let engineLocked = false;
let minimap = false;
let mapdebug = false;
let heightmapDebug = false;

const GameScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function GameScene() {
      Phaser.Scene.call(this, {
        key: 'GameScene'
      });
    },

  groundLayer: {},
  itemLayer: {},
  fov: {},

  preload: function () {

    // preload the Tiled map of the random features that will be used 
    // to fill the game map with random map features
    this.load.tilemapTiledJSON('featureMap', 'data/map.json');

    // preload the tileset image that contains all the tiles of the map
    this.load.spritesheet('tilesetImage', 'assets/images/tiles.png', {
      frameWidth: 24,
      frameHeight: 21
    });
  },

  create: function () {

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
    layer = this.groundLayer;

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

    // generate map features
    layer.forEachTile(function (tile) {

      // if there is a spring
      if (tile.properties && tile.properties.spring) {

        // put down a river
        River.put(noise, tile.x, tile.y, layer);

      }

      // if there is a floor
      else if (tile.properties && tile.properties.floor) {

        // put down a house
        House.put(noise, tile.x, tile.y, layer);
      }
    }, {
      layer: layer,
      noise: noise
    });
    
    if (!mapdebug) {
      this.groundLayer.forEachTile(tile => (tile.alpha = 0));
    }
    this.itemLayer.forEachTile(tile => (tile.alpha = 0));

    if (heightmapDebug) {
      for (var j = 0; j < map.height; j++) {
        for (var i = 0; i < map.width; i++) {
          tile = this.groundLayer.getTileAt(j, i);
          tile.alpha = (heightmap[j][i] - min) / (max - min);
        }
      }
    }

    /**
     * Create player
     */
    player = new Actor(this, 127, 127, 'tilesetImage', 25, this.groundLayer, true);
    player.setOrigin(0);
    this.showFOV(player.x, player.y);

    /**
     * Create zombie
     */
    // var zombie = new Actor(this, 131, 127, 'tilesetImage', 50, this.groundLayer);
    // zombie.setOrigin(0);
    // zombie.alpha = 0;
    // enemies.push(zombie);

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
    camera.setPosition(372, 5);
    camera.setSize(648, 567);
    camera.startFollow(player, true, 1, 1, -12, -10);
    if (minimap) {
      smallCamera = this.cameras.add(635, 210, 400, 400);
      smallCamera.zoom = 0.03;
    }

    /**
     * Constrain the camera so that it isn't allowed to move outside the
     * width/height of tilemap
     */
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    engine.start();

    this.events.on('playerDied', function () {
      this.scene.start('DeathScene');
    }.bind(this));
  },

  update: function () {

    var x, y, tile;

    /**
     * Ignore GUI input
     */
    if (this.input.activePointer.x < 372) {
      return;
    }

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
    if (this.isPassableAtWorldXY(x, y)) {

      /** If passable turn the pointer yellow */
      marker.lineStyle(1, 0xffff00, 1);
      marker.strokeRect(0, 0, 24, 21);

      /**
       * Check if the player clicked
       */
      if (this.input.manager.activePointer.justDown && engineLocked) {

        engineLocked = false;

        this.time.delayedCall(10, function () {

          /**
           * Move the player towards the pointer
           */
          x = this.groundLayer.worldToTileX(x);
          y = this.groundLayer.worldToTileY(y);
          var actor = this.getActorAt(x, y);
          if (actor) {
            if (actor !== player) {
              player.damage(actor);
            }
          } else {
            player.x = this.groundLayer.tileToWorldX(x);
            player.y = this.groundLayer.tileToWorldY(y);
          }

          /**
           * Dispatch the player moved event
           */
          this.events.emit('playerMoved');

          /**
           * Update field of view
           */
          this.showFOV(player.x, player.y);

          scheduler.setDuration(1.0 / player.speed);

          engine.unlock();

        }.bind(this));
      }
    } else {

      /**
       * If unpassable turn the pointer grey
       */
      marker.lineStyle(1, 0x888888, 1);
      marker.strokeRect(0, 0, 24, 21);
    }
  },

  showFOV: function (x, y) {

    /**
     * Overlay fog of war on every tile that was already visible
     */
    if (!mapdebug) {
      this.groundLayer.forEachTile(tile => (tile.alpha = tile.alpha ? 0.3 : 0));
    }
    this.itemLayer.forEachTile(tile => (tile.alpha = tile.alpha ? 0.3 : 0));
    enemies.forEach(function (enemy) {
      enemy.alpha = 0;
    });

    /**
     * Find the visible tiles
     */
    tileXY = this.groundLayer.worldToTileXY(x, y);
    this.fov.compute(tileXY.x, tileXY.y, 13, function (x, y) {

      /**
       * Show the visible tiles
       */
      var tile = this.groundLayer.getTileAt(x, y);
      if (tile) {
        tile.alpha = 1;
        tile = this.itemLayer.getTileAt(x, y);
        if (tile) {
          tile.alpha = 1;
        }
        var actor = this.getActorAt(x, y);
        if (actor) {
          actor.alpha = 1;
        }
      }
    }.bind(this));
  },

  isTransparent: function (x, y) {
    var playerXY, tile;

    /**
     * Return true if the position is the player's position or if it is not opaque
     */
    playerXY = this.groundLayer.worldToTileXY(player.x, player.y);
    tile = this.groundLayer.getTileAt(x, y);
    return x === playerXY.x && y === playerXY.y ||
      tile && !tile.properties.opaque;
  },

  isPassableAtXY: function (x, y) {
    return !this.groundLayer.getTileAt(x, y).properties.unpassable;
  },

  isPassableAtWorldXY: function (x, y) {
    return !this.groundLayer.getTileAtWorldXY(x, y).properties.unpassable;
  },

  getActorAt: function (x, y) {
    if (player.isAtXY(x, y)) {
      return player;
    }
    for (var i = 0; i < enemies.length; i += 1) {
      if (enemies[i].isAtXY(x, y)) {
        return enemies[i];
      }
    }
  }

});
