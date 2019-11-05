class SimplexMap {
  constructor(scene, tilesetImage, config) {

    this.config = config;

    // The scene where the map is displayed.
    this.scene = scene;

    // The key of the image this map will use to render its tiles.
    this.tilesetImage = tilesetImage;

    // The Simplex noise that serve as the base of the map.
    this.noises = [];

    this.objectNoise = new ROT.Noise.Simplex();
    
    this.config.layers.forEach(function () {
      this.noises.push(new ROT.Noise.Simplex());
    }.bind(this));

    // The container of terrain tiles of this map. This will help to display every terrain tile under the actors. Without this, the player would be displayed under the terrain making him invisible.
    this.terrain = this.scene.add.container();

    // The collection of positions containing a tile image and a unique key that determines the attributes of that tile and the image to be displayed in case the previously used image object of this tile has been reused elsewhere while this tile was hidden.
    this.tiles = {}; 
  }

  // Tiles are added from the pool or created on the fly.
  addTile(x, y) {

    // The tile we add or create.
    let tile;

    // The key of the tile that should be displayed at the given position.
    let tileName;

    // If this is the first time a tile is set to be added at this position.
    if (this.tiles[x + ',' + y] === undefined) {      

      // Generate the key of the tile.
      tileName = this.getTileNameAt(x, y);

      // Save the key of the tile at the given position for later use, when this tile becames visible again, and the original image of this tile has been reused elsewere since then. Saving this value means that no tile name of a specific position will be requested from the simplex map more than once.
      this.tiles[x + ',' + y] = {
        name: tileName
      }

      // If this is the first time this tile is displayed there is a chance that it was hiding an enemy or an item.
      this.addEnemyOrItem(x, y);
    }

    // If the image of the tile is not displayed at the given position.
    if (this.tiles[x + ',' + y].image === undefined) {

      // Create the image of the tile.
      // tile = this.scene.add.image(x * 24 + 12, y * 21 + 11, this.tilesetImage, this.tiles[x + ',' + y].name);
      tile = new ActiveImage({
        scene: this.scene,
        frame: this.tiles[x + ',' + y].name,
        texture: this.tilesetImage,
        x: x * 24 + 12,
        y: y * 21 + 11
      });

      // Save the image of the tile at the given position for later use during every upcoming update when this tile is still visible. 
      this.tiles[x + ',' + y].image = tile;

      // Save its tile position to make the translation to tile positions easier when this tile is interacted with.
      this.tiles[x + ',' + y].image.tileX = x;
      this.tiles[x + ',' + y].image.tileY = y;

      // Set the tile to start the show animation from a full transparency.
      this.tiles[x + ',' + y].image.alpha = 0;

      // Add the tile to the container of terrain tiles to show it under the actor.
      //this.terrain.add(this.tiles[x + ',' + y].image)
      this.tiles[x + ',' + y].image.depth = 1;

      // Set the tile to show in the current update.
      this.tiles[x + ',' + y].toShow = true;

      // If the tile is walkable by the player.
      if (this.scene.player.walksOnXY(x, y)) {

        this.scene.input.on('pointerup', function () {

          // Set the current position of the actor as his current target to prevent him attacking the enemy automatically as his next actions.
          this.scene.player.target = {
            x: this.scene.player.tileX,
            y: this.scene.player.tileY
          };

          // Reset his path and let him decide about his next action.
          this.scene.player.path = [];
        });

        this.tiles[x + ',' + y].image.on('pointerdown', function () {
          this.scene.targetTile = this.scene.add.graphics();
          this.scene.targetTile.fillStyle(0xffff00, 0.2);
          this.scene.targetTile.fillRect(this.x - 11, this.y - 11, 23, 20);
          this.scene.targetTile.depth = 5;
        // });

        // // Set the tile to react to clicks.
        // this.tiles[x + ',' + y].image.on('click', function () {

          // Set that tile as the new target of the player.
          this.scene.player.target.x = x;
          this.scene.player.target.y = y;

          // Move the player towards the new target.
          this.scene.player.order();
        });

        // Set the tile to react to mouse over events.
        this.tiles[x + ',' + y].image.on('pointerover', function () {

          // Move the marker over the tile.
          this.scene.tweens.add({
            targets: this.scene.marker,
            x: this.x - 11,
            y: this.y - 11,
            ease: 'Quad.easeOut',
            duration: 100 / game.speed
          });
        });
      }
    }

    // Set the tile not to hide in the current update.
    this.tiles[x + ',' + y].toHide = false;

    // Get the actor at the given position.
    let actor = this.scene.getActorAt(x, y);

    // If there is an actor and he is not the player, it means that he is an enemy.
    if (actor && actor !== this.scene.player) {
      
      // If the enemy is not visible in result of an earlier hide animation that reduced his alpha to 0.
      if (actor.alpha === 0) {

        // Add the enemy to the list of objects to show.
        this.scene.objectsToShow.push(actor);
      }

      // Make the enemy not to hide in the next update as it was already set to hide in the beginning of the compute FOV.
      actor.toHide = false;
    }
    
    // Return the just created or already displayed tile. 
    return this.tiles[x + ',' + y].image;
  }

  // Check if an enemy should be added at the given position and add it if needed.
  addEnemyOrItem(x, y) {

    // The enemy generated at the given position.
    let enemy;

    // The noise that determines the probability of the enemy generation.
    let n = this.objectNoise.get(x / 3, y / 3);

    // The name of the tile at the given position that will determine the type of the enemy.
    let tileName = this.tiles[x + ',' + y].name;

    let items = Object.keys(this.scene.itemTypes);

    let itemName = items[ROT.RNG.getUniformInt(0, items.length - 1)];
    
    if (n > 0.997) {
      if (
        tileName === 'sand' || 
        tileName === 'stoneFloor' || 
        tileName === 'grass' || 
        tileName === 'redFlower' || 
        tileName === 'yellowFlower' ||
        tileName === 'dirt' ||
        tileName === 'gravel' ||
        tileName === 'ford') {
          let item = this.scene.itemTypes[itemName];
          item.frame = itemName;
          this.putItem(x, y, [item]);
          return;
      }
    }
    let enemies = {
      grass: n > 0.9 ? 'skeleton' : (n > 0.8 ? 'zombie' : ''),
      bush: n > 0.5 ? 'hobgoblin' : '',
      gravel: n > 0.7 ? 'troll' : (n > 0.5 ? 'goblin' : ''),
      ford: n > 0.7 ? 'orchArcher' : (n > 0.5 ? 'orch' : '')
    }    

    let enemyType = enemies[tileName];
    
    if (enemyType) {
      enemy = new Actor(this.scene, x, y, 'tiles', enemyType);
      this.scene.enemies.push(enemy);
      enemy.name += ' ' + this.scene.enemies.filter(e => e.tileName === enemy.tileName).length;
    }
  }

  // Put a list of items on the map.
  putItem(x, y, itemList) {
    let items = itemList.filter(function (value) {
      if (value) {
        return value.frame;
      }
      return false;
    });
    let frame = items[0].frame;
    if (!this.tiles[x + ',' + y].itemImage) {
      this.tiles[x + ',' + y].itemImage = this.scene.add.image(x * 24 + 12, y * 21 + 11, 'tiles', frame);
      this.tiles[x + ',' + y].itemImage.depth = 2;
    } else if (this.tiles[x + ',' + y].itemImage.frame.name !== frame) {
      this.tiles[x + ',' + y].itemImage.setTexture('tiles', frame);
    }
    this.tiles[x + ',' + y].itemList = itemList;
  }

  // Add a list of items to a list of items on the map.
  addItem(x, y, itemList) {
    if (this.tiles[x + ',' + y].itemList) {
      this.tiles[x + ',' + y].itemList = 
        this.tiles[x + ',' + y].itemList.concat(itemList);
    } else {
      this.scene.map.putItem(x, y, itemList);
    }
  }

  // Remove an item from the map.
  removeItem(x, y) {
    if (this.tiles[x + ',' + y].itemImage) {
      this.tiles[x + ',' + y].itemImage.destroy();
      this.tiles[x + ',' + y].itemImage = undefined;
      this.tiles[x + ',' + y].itemList = null;
    }
  }

  // Hide the tile that is not visible currently for the player.
  hide(tile) {

    // Destroy the tile so it won't show up in the next update but keep its name so it can be recreated easily.
    tile.image.destroy();

    // Set its reference undefined so further updates won't pick it up.
    tile.image = undefined;

    // Set the tile as not to hide to prevent it trying to play the hide animation again in the next update.
    tile.toHide = false;
  }

  getTileNameAt(x, y) {
    if (-4 < x && x < 6 && -4 < y && y < 6) {
      if (-3 < x && x < 5 && -3 < y && y < 5) {
        if (-2 < x && x < 4 && -2 < y && y < 4) {
          if (x === 1 && y === 1) {
            return 'portalTile';
          }
          return 'stoneFloor';
        }
        if (x === 1 || y === 1) {
          return 'gate';
        }
        return 'stoneWall';
      }
      if (x === 1 || y === 1) {
        return 'dirt';
      }
    }
    let nx = x / this.config.layers[0].frequency;
    let ny = y / this.config.layers[0].frequency;
    let v = 0;
    let iv = 0;
    for (let o = 1; o < this.config.layers[0].octaves + 1; o += 1) {
      v += 1 / Math.pow(o, 1.1) * this.noises[0].get(o * nx, o * ny);
      iv += 1 / Math.pow(o, 1.1);
    }
    v /= iv;
    v = (1 + v) * 50;
    let nx2 = 0;
    let ny2 = 0;
    let v2 = 0;
    let iv2 = 0;
    if (this.config.layers[1]) {
      nx2 = x / this.config.layers[1].frequency;
      ny2 = y / this.config.layers[1].frequency;
      for (let o2 = 1; o2 < this.config.layers[1].octaves + 1; o2 += 1) {
        v2 += 1 / Math.pow(o2, 1.1) * this.noises[1].get(o2 * nx2, o2 * ny2);
        iv2 += 1 / Math.pow(o2, 1.1);
      }
      v2 /= iv2;
      v2 = (1 + v2) * 50;
    }
    let nx3 = 0;
    let ny3 = 0;
    let v3 = 0;
    let iv3 = 0;
    if (this.config.layers[2]) {
      nx3 = x / this.config.layers[2].frequency;
      ny3 = y / this.config.layers[2].frequency;
      for (let o3 = 1; o3 < this.config.layers[2].octaves + 1; o3 += 1) {
        v3 += 1 / Math.pow(o3, 1.1) * this.noises[2].get(o3 * nx3, o3 * ny3);
        iv3 += 1 / Math.pow(o3, 1.1);
      }
      v3 /= iv3;
      v3 = (1 + v3) * 50;
    }
    for (let r = 0; r < this.config.rules.length; r+= 1) {
      if (v < this.config.rules[r].limit) {
        if (this.config.rules[r].tileName) {
          return this.config.rules[r].tileName;
        }
        for (let r2 = 0; r2 < this.config.rules[r].rules.length; r2 += 1) {
          if (v2 < this.config.rules[r].rules[r2].limit) {
            if (this.config.rules[r].rules[r2].tileName) {
              return this.config.rules[r].rules[r2].tileName;
            }
            for (let r3 = 0; r3 < this.config.rules[r].rules[r2].rules.length; r3 += 1) {
              if (v3 < this.config.rules[r].rules[r2].rules[r3].limit) {
                if (this.config.rules[r].rules[r2].rules[r3].tileName) {
                  return this.config.rules[r].rules[r2].rules[r3].tileName;
                }
              }
            }
          }
        }
      }
    }
  }
}