const fov = new ROT.FOV.PreciseShadowcasting(isTransparent);
const scheduler = new ROT.Scheduler.Action();
const engine = new ROT.Engine(scheduler)
let map;
let player;
let marker;
let groundLayer;
let itemLayer;
let enemies = [];

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
    groundLayer = map.createDynamicLayer("tiles", tileset, 0, 0);
    itemLayer = map.createBlankDynamicLayer("items", tileset, 0, 0);
    groundLayer.forEachTile(tile => (tile.alpha = 0));
    itemLayer.forEachTile(tile => (tile.alpha = 0));

    /**
     * Create player
     */
    var actor = map.findObject("objects", obj => obj.type === "player");
    player = new Actor(this, actor.x, actor.y, "tiles", actor.gid - 1, true);
    player.setOrigin(0);
    this.showFOV(actor.x, actor.y);

    /**
     * Create zombie
     */
    actor = map.findObject("objects", obj => obj.type === "zombie");
    var zombie = new Actor(this, actor.x, actor.y, "tiles", actor.gid - 1,);
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

    /**
     * Constrain the camera so that it isn't allowed to move outside the
     * width/height of tilemap
     */
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    engine.start();
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
      if (this.input.manager.activePointer.justDown) {
        
        /**
         * Move the player towards the pointer
         */
        player.x = x;
        player.y = y;

        /**
         * Dispatch the player moved event
         */
        this.events.emit('playerMoved');

        /**
         * Update field of view
         */
        this.showFOV(x, y);

        scheduler.setDuration(1.0 / player.speed);
        engine.unlock();
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
    groundLayer.forEachTile(tile => (tile.alpha = tile.alpha ? 0.3 : 0));
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

function isTransparent (x, y) {
  var playerXY, tile;

  /**
   * Return true if the position is the player's position or if it is not opaque
   */
  playerXY = groundLayer.worldToTileXY(player.x, player.y);
  tile = groundLayer.getTileAt(x, y);
  return x === playerXY.x && y === playerXY.y 
    || tile && !tile.properties.opaque;
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

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  parent: "game-container",
  pixelArt: true,
  scene: [GameScene, GUIScene]
});
