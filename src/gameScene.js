const fov = new ROT.FOV.PreciseShadowcasting(isTransparent);
const scheduler = new ROT.Scheduler.Action();
const engine = new ROT.Engine(scheduler)
let map;
let heightmap;
let player;
let marker;
let groundLayer;
let itemLayer;
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

  preload: function () {
    this.load.spritesheet("tiles", "assets/images/tiles.png", {
      frameWidth: 24,
      frameHeight: 21
    });
    this.load.tilemapTiledJSON("map", "data/map.json");
  },

  create: function () {

    features = this.make.tilemap({
      key: "map"
    });

    map = this.make.tilemap({
      tileWidth: 24,
      tileHeight: 21,
      width: 256,
      height: 256
    });

    /** 
     * Parameters are the name of the tileset in Tiled and then the key of the
     * tileset image in Phaser's cache (i.e. the name used in preload)
     */
    const featureTiles = features.addTilesetImage("tiles", "tiles");
    const tileset = map.addTilesetImage("tiles");

    /**
     * Parameters: layer name (or index) from Tiled, tileset, x, y
     */
    featureLayer = features.createDynamicLayer("tiles", featureTiles, 0, 0);
    groundLayer = map.createBlankDynamicLayer("tiles", tileset, 0, 0);
    itemLayer = map.createBlankDynamicLayer("items", tileset, 0, 0);

    /**
     * Generate a random forest on the whole map
     */
    groundLayer.weightedRandomize(0, 0, map.width, map.height, [{
        index: 0,
        weight: 100
      }, // Grass
      {
        index: 1,
        weight: 1
      }, // Red Flower
      {
        index: 2,
        weight: 1
      }, // Yellow Flower
      {
        index: 16,
        weight: 3
      }, // Bush
      {
        index: 17,
        weight: 10
      } // Tree
    ]);

    /**
     * Set the properties of every bush and tree
     */
    groundLayer.forEachTile(function (tile) {
      if (tile.index === 16 || tile.index === 17) {
        if (!mapdebug) {
          tile.properties.unpassable = true;
          tile.properties.opaque = true;
        }
      }
    });

    /**
     * Generate height map
     */
    var noise = new ROT.Noise.Simplex();
    heightmap = [];
    var max = 0;
    var min = 0;
    for (var j = 0; j < map.height; j++) {
      heightmap[j] = [];
      for (var i = 0; i < map.width; i++) {

        /**
         * Generate a smooth map then apply 3 levels of erosion
         */
        heightmap[j][i] =
          noise.get(i / 96, j / 96) * 256 -
          noise.get(i / 64, j / 64) * 64 -
          noise.get(i / 32, j / 32) * 64 -
          noise.get(i / 16, j / 16) * 64;
        max = heightmap[j][i] > max ? heightmap[j][i] : max;
        min = heightmap[j][i] < min ? heightmap[j][i] : min;
        var tile;
        var index = -1;
        var properties = {};
        if (heightmap[j][i] > 192) {
          if (Math.random() < 0.995) {

            /**
             * Most of the times change the highest parts to mountain rocks
             */
            index = 21;
            properties = {
              unpassable: true,
              opaque: true
            }
          } else {

            /**
             * Sometimes put down a spring
             */
            index = 11;
          }
        } else if (heightmap[j][i] < -192) {

          /**
           * Fill the lowest parts with water
           */
          index = 12;
          properties = {
            unpassable: true
          };
        }
        if (index !== -1) {
          tile = new Phaser.Tilemaps.Tile(groundLayer, index, i, j, 24, 21, 24, 21);
          tile = groundLayer.putTileAt(tile, j, i);
          tile.properties = properties;
        }
      }
    }

    /**
     * Put down the start location
     */
    var start = features.findObject("features", obj => obj.name === "start");
    featureLayer.forEachTile(function (tile) {
      tile.alpha = 0;
      tile.index -= 1;
      groundLayer.putTileAt(tile, tile.x + 122, tile.y + 122);
    }, this, start.x, start.y, start.width / 24, start.height / 21);

    /**
     * Generate rivers
     */
    groundLayer.forEachTile(function (tile) {
      var newTile;
      if (tile.index === 11) {
        var x = tile.x;
        var y = tile.y;
        for (var i = 0; i < 100; i += 1) {
          if (heightmap[x + 1] && heightmap[x + 1][y] < heightmap[x][y]) {
            newTile = groundLayer.putTileAt(12, ++x, y);
            newTile.properties = {
              unpassable: true
            };
            if (Math.random() > 0.7) {
              newTile = groundLayer.putTileAt(12, ++x, y);
              newTile.properties = {
                unpassable: true
              };
              if (Math.random() > 0.7) {
                newTile = groundLayer.putTileAt(Math.random() > 0.5 ? 13 : 11, ++x, y);
                if (newTile.index === 13) {
                  newTile.properties = {
                    unpassable: true
                  };
                }
              }
            }
          } else if (heightmap[x - 1] &&
            heightmap[x - 1][y] &&
            heightmap[x] &&
            heightmap[x][y] &&
            heightmap[x - 1][y] < heightmap[x][y]) {
            newTile = groundLayer.putTileAt(12, --x, y);
            newTile.properties = {
              unpassable: true
            };
            if (Math.random() > 0.7) {
              newTile = groundLayer.putTileAt(12, --x, y);
              newTile.properties = {
                unpassable: true
              };
              if (Math.random() > 0.7) {
                newTile = groundLayer.putTileAt(Math.random() > 0.5 ? 13 : 11, --x, y);
                if (newTile.index === 13) {
                  newTile.properties = {
                    unpassable: true
                  };
                }
              }
            }
          }
          if (heightmap[x] && heightmap[x][y + 1] && heightmap[x][y + 1] < heightmap[x][y]) {
            newTile = groundLayer.putTileAt(12, x, ++y);
            newTile.properties = {
              unpassable: true
            };
            if (Math.random() > 0.7) {
              newTile = groundLayer.putTileAt(12, x, ++y);
              newTile.properties = {
                unpassable: true
              };
              if (Math.random() > 0.7) {
                newTile = groundLayer.putTileAt(Math.random() > 0.5 ? 13 : 11, x, ++y);
                if (newTile.index === 13) {
                  newTile.properties = {
                    unpassable: true
                  };
                }
              }
            }
          } else if (heightmap[x] && heightmap[x][y - 1] && heightmap[x][y - 1] < heightmap[x][y]) {
            newTile = groundLayer.putTileAt(12, x, --y);
            newTile.properties = {
              unpassable: true
            };
            if (Math.random() > 0.7) {
              newTile = groundLayer.putTileAt(12, x, --y);
              newTile.properties = {
                unpassable: true
              };
              if (Math.random() > 0.7) {
                newTile = groundLayer.putTileAt(Math.random() > 0.5 ? 13 : 11, x, --y);
                if (newTile.index === 13) {
                  newTile.properties = {
                    unpassable: true
                  };
                }
              }
            }
          }
        }
        var lake = features.findObject("features", obj => obj.name === "lake");
        this.originX = x - 3;
        this.originY = y - 3;
        this.lakeX = lake.x / 24;
        this.lakeY = lake.y / 21;
        featureLayer.forEachTile(function (tile) {
          var newTile;
          tile.alpha = 0;
          newTile = groundLayer.putTileAt(tile.index - 1, tile.x - this.lakeX + this.originX, tile.y - this.lakeY + this.originY);
          if (newTile.index === 12) {
            newTile.properties = {
              unpassable: true
            };
          }
        }, this, lake.x / 24, lake.y / 21, lake.width / 24, lake.height / 21);
      }
    });

    if (!mapdebug) {
      groundLayer.forEachTile(tile => (tile.alpha = 0));
    }
    itemLayer.forEachTile(tile => (tile.alpha = 0));

    if (heightmapDebug) {
      for (var j = 0; j < map.height; j++) {
        for (var i = 0; i < map.width; i++) {
          tile = groundLayer.getTileAt(j, i);
          tile.alpha = (heightmap[j][i] - min) / (max - min);
        }
      }
    }

    /**
     * Create player
     */
    player = new Actor(this, 127 * 24, 127 * 21, "tiles", 25, true);
    player.setOrigin(0);
    this.showFOV(player.x, player.y);

    /**
     * Create zombie
     */
    var zombie = new Actor(this, 131 * 24, 127 * 21, "tiles", 50);
    zombie.setOrigin(0);
    zombie.alpha = 0;
    enemies.push(zombie);

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
    if (isPassableAtWorldXY(x, y)) {

      /** If passable turn the pointer yellow */
      marker.lineStyle(1, 0xffff00, 1);
      marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);

      /**
       * Check if the player clicked
       */
      if (this.input.manager.activePointer.justDown && engineLocked) {

        engineLocked = false;

        this.time.delayedCall(10, function () {

          /**
           * Move the player towards the pointer
           */
          x = groundLayer.worldToTileX(x);
          y = groundLayer.worldToTileY(y);
          var actor = getActorAt(x, y);
          if (actor) {
            if (actor !== player) {
              player.damage(actor);
            }
          } else {
            player.x = groundLayer.tileToWorldX(x);
            player.y = groundLayer.tileToWorldY(y);
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
      marker.strokeRect(0, 0, map.tileWidth, map.tileHeight);
    }
  },

  showFOV: function (x, y) {

    /**
     * Overlay fog of war on every tile that was already visible
     */
    if (!mapdebug) {
      groundLayer.forEachTile(tile => (tile.alpha = tile.alpha ? 0.3 : 0));
    }
    itemLayer.forEachTile(tile => (tile.alpha = tile.alpha ? 0.3 : 0));
    enemies.forEach(function (enemy) {
      enemy.alpha = 0;
    });

    /**
     * Find the visible tiles
     */
    tileXY = groundLayer.worldToTileXY(x, y);
    fov.compute(tileXY.x, tileXY.y, 13, function (x, y) {

      /**
       * Show the visible tiles
       */
      var tile = groundLayer.getTileAt(x, y);
      if (tile) {
        tile.alpha = 1;
        tile = itemLayer.getTileAt(x, y);
        if (tile) {
          tile.alpha = 1;
        }
        var actor = getActorAt(x, y);
        if (actor) {
          actor.alpha = 1;
        }
      }
    });
  },
});

function isTransparent(x, y) {
  var playerXY, tile;

  /**
   * Return true if the position is the player's position or if it is not opaque
   */
  playerXY = groundLayer.worldToTileXY(player.x, player.y);
  tile = groundLayer.getTileAt(x, y);
  return x === playerXY.x && y === playerXY.y ||
    tile && !tile.properties.opaque;
}

function isPassableAtXY(x, y) {
  return !groundLayer.getTileAt(x, y).properties.unpassable;
}

function isPassableAtWorldXY(x, y) {
  return !groundLayer.getTileAtWorldXY(x, y).properties.unpassable;
}

function getActorAt(x, y) {
  if (player.isAtXY(x, y)) {
    return player;
  }
  for (var i = 0; i < enemies.length; i += 1) {
    if (enemies[i].isAtXY(x, y)) {
      return enemies[i];
    }
  }
}