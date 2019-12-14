import Simplex from '../../lib/rot/noise/simplex.js'
/**
 * Represents the game world where the gameplay itself happens.
 *
 * @export
 * @class WorldMap
 */
export default class WorldMap {
  /**
   * Configures the world map based on external map configuration objects.
   *
   * @static
   * @param {*} mapConfig The map config object.
   * @param {*} itemTypes The item types object.
   * @param {*} actorTypes The actor types object.
   * @memberof WorldMap
   */
  static setConfig(mapConfig, itemTypes, actorTypes) {
    WorldMap.config = mapConfig;
    WorldMap.config.layers.forEach(({name}) =>
      WorldMap.terrainNoises.set(name, new Simplex()));
    WorldMap.itemTypes = Object.values(itemTypes).sort((a, b) =>
      a.price - b.price);
    WorldMap.actorTypes = actorTypes;
  }
  // // Tiles are added from the pool or created on the fly.
  // addTile(x, y) {

  //   // The tile we add or create.
  //   let tile;

  //   // The key of the tile that should be displayed at the given position.
  //   let tileName;

  //   // If this is the first time a tile is set to be added at this position.
  //   if (this.tiles[x + ',' + y] === undefined) {      

  //     // Generate the key of the tile.
  //     tileName = this.getTileNameAt(x, y);

  //     // Save the key of the tile at the given position for later use, when this tile becames visible again, and the original image of this tile has been reused elsewere since then. Saving this value means that no tile name of a specific position will be requested from the simplex map more than once.
  //     this.tiles[x + ',' + y] = {
  //       name: tileName
  //     }

  //     // If this is the first time this tile is displayed there is a chance that it was hiding an enemy or an item.
  //     this.addEnemyOrItem(x, y);
  //   }

  //   // If the image of the tile is not displayed at the given position.
  //   if (this.tiles[x + ',' + y].image === undefined) {

  //     // Create the image of the tile.
  //     tile = new ActiveImage({
  //       scene: this.scene,
  //       frame: this.tiles[x + ',' + y].name,
  //       texture: this.tilesetImage,
  //       tileX: x,
  //       tileY: y,
  //       x: x * 24 + 12,
  //       y: y * 21 + 11
  //     });

  //     // Save the image of the tile at the given position for later use during every upcoming update when this tile is still visible. 
  //     this.tiles[x + ',' + y].image = tile;

  //     // Save its tile position to make the translation to tile positions easier when this tile is interacted with.
  //     this.tiles[x + ',' + y].image.tileX = x;
  //     this.tiles[x + ',' + y].image.tileY = y;

  //     // Set the tile to start the show animation from a full transparency.
  //     this.tiles[x + ',' + y].image.alpha = 0;

  //     // Show the tile under the actor.
  //     this.tiles[x + ',' + y].image.depth = 1;

  //     // Set the tile to show in the current update.
  //     this.tiles[x + ',' + y].toShow = true;

  //     this.tiles[x + ',' + y].image.on('click', function () {

  //       // If the tile is walkable by the player.
  //       if (this.scene.lastSelected.walksOnXY(this.config.tileX, this.config.tileY)) {

  //         this.scene.targetTile = this.scene.add.graphics();
  //         this.scene.targetTile.fillStyle(0xffff00, 0.2);
  //         this.scene.targetTile.fillRect(this.x - 12, this.y - 10.5, 24, 21);
  //         this.scene.targetTile.depth = 5;

  //         // Notify the player about the successful command.
  //         //this.scene.time.delayedCall(50, function () { 
  //           this.scene.events.emit('order', x , y);
  //         //}.bind(this));
  //       }
  //     });

  //     // Set the tile to react to mouse over events.
  //     this.tiles[x + ',' + y].image.on('pointerover', function () {

  //       // If the tile is walkable by the player.
  //       if (this.scene.lastSelected.walksOnXY(this.config.tileX, this.config.tileY)) {

  //         // Move the marker over the tile.
  //         this.scene.tweens.add({
  //           targets: this.scene.marker,
  //           x: this.x - 11.5,
  //           y: this.y - 10,
  //           ease: 'Quad.easeOut',
  //           duration: 100 / game.speed
  //         });
  //       }
  //     });
  //   }

  //   // Set the tile not to hide in the current update.
  //   this.tiles[x + ',' + y].toHide = false;

  //   // Get the actor at the given position.
  //   let actor = this.scene.getActorAt(x, y);

  //   // If there is an actor and he is not the player, it means that he is an enemy.
  //   if (actor && !this.scene.heroes.includes(actor)) {
      
  //     // If the enemy is not visible in result of an earlier hide animation that reduced his alpha to 0.
  //     if (actor.alpha === 0) {

  //       // Add the enemy to the list of objects to show.
  //       this.scene.objectsToShow.push(actor);
  //     }

  //     // Make the enemy not to hide in the next update as it was already set to hide in the beginning of the compute FOV.
  //     actor.toHide = false;
  //   }
    
  //   // Return the just created or already displayed tile. 
  //   return this.tiles[x + ',' + y].image;
  // }

  // // Check if an enemy should be added at the given position and add it if needed.
  // static getMonster(x, y) {

  //   const n = WorldMap.noises[WorldMap.noises.length - 1].get(x * 4, y * 4);

  //   // The enemy generated at the given position.
  //   let enemy;

  //   // The noise that determines the probability of the enemy generation.
  //   let n = this.objectNoise.get(x / 3, y / 3);

  //   // The name of the tile at the given position that will determine the type of the enemy.
  //   let tileName = this.tiles[x + ',' + y].name;

  //   let items = Object.keys(this.scene.itemTypes);

  //   let itemName = items[ROT.RNG.getUniformInt(0, items.length - 1)];
    
  //   if (n > 0.997) {
  //     if (
  //       tileName === 'sand' || 
  //       tileName === 'stoneFloor' || 
  //       tileName === 'grass' || 
  //       tileName === 'redFlower' || 
  //       tileName === 'yellowFlower' ||
  //       tileName === 'dirt' ||
  //       tileName === 'gravel' ||
  //       tileName === 'ford') {
  //         let item = this.scene.itemTypes[itemName];
  //         item.frame = itemName;
  //         this.putItem(x, y, [item]);
  //         return;
  //     }
  //   }
  //   let enemies = {
  //     redFlower: n > 0 ? 'zombie' :  '',
  //     yellowFlower: n > 0 ? 'skeleton' : '',
  //     bush: n > 0.5 ? 'hobgoblin' : '',
  //     gravel: n > 0.7 ? 'troll' : (n > 0.5 ? 'goblin' : ''),
  //     ford: n > 0.7 ? 'orchArcher' : (n > 0.5 ? 'orch' : ''),
  //     sand: n > 0.9 ? 'magician' : (n > 0.85 ? 'monk' : (n > 0.8 ? 'warrior' : '')),
  //   }    

  //   let enemyType = enemies[tileName];
    
  //   if (enemyType) {
  //     enemy = new Actor(this.scene, x, y, 'tiles', enemyType);
  //     this.scene.enemies.push(enemy);
  //   }
  // }

  // // Put a list of items on the map.
  // putItem(x, y, itemList) {
  //   let items = itemList.filter(function (value) {
  //     if (value) {
  //       return value.frame;
  //     }
  //     return false;
  //   });
  //   let frame = items[0].frame;
  //   if (!this.tiles[x + ',' + y].itemImage) {
  //     this.tiles[x + ',' + y].itemImage = this.scene.add.image(x * 24 + 12, y * 21 + 11, 'tiles', frame);
  //     this.tiles[x + ',' + y].itemImage.depth = 2;
  //   } else if (this.tiles[x + ',' + y].itemImage.frame.name !== frame) {
  //     this.tiles[x + ',' + y].itemImage.setTexture('tiles', frame);
  //   }
  //   this.tiles[x + ',' + y].itemList = itemList;
  // }

  // // Add a list of items to a list of items on the map.
  // addItem(x, y, itemList) {
  //   if (this.tiles[x + ',' + y].itemList) {
  //     this.tiles[x + ',' + y].itemList = 
  //       this.tiles[x + ',' + y].itemList.concat(itemList);
  //   } else {
  //     this.scene.map.putItem(x, y, itemList);
  //   }
  // }

  // // Remove an item from the map.
  // removeItem(x, y) {
  //   if (this.tiles[x + ',' + y].itemImage) {
  //     this.tiles[x + ',' + y].itemImage.destroy();
  //     this.tiles[x + ',' + y].itemImage = undefined;
  //     this.tiles[x + ',' + y].itemList = null;
  //   }
  // }

  // // Hide the tile that is not visible currently for the player.
  // hide(tile) {

  //   // Destroy the tile so it won't show up in the next update but keep its name so it can be recreated easily.
  //   tile.image.destroy();

  //   // Set its reference undefined so further updates won't pick it up.
  //   tile.image = undefined;

  //   // Set the tile as not to hide to prevent it trying to play the hide animation again in the next update.
  //   tile.toHide = false;
  // }

  // /**
  //  * Return the name of the actor that can be found at the given position.
  //  *
  //  * @param {*} x The x coordinate of the tile.
  //  * @param {*} y The y coordinate of the tile.
  //  * @returns The name of the actor found at the tile.
  //  * @memberof SimplexMap
  //  */
  // getActorFrame(x, y) {

  //   // Return the frame name of the actor.
  //   return this.actors.find(actor => actor.x === x && actor.y === y).frame;
  // }

  // /**
  //  * Return the frame name of the tile, item, and actor that can be found at the given position.
  //  *
  //  * @param {*} x The x coordinate of the tile.
  //  * @param {*} y The y coordinate of the tile.
  //  * @returns The array of the tile, item and actor frame name.
  //  * @memberof SimplexMap
  //  */
  // getFrames(x, y) {
  //   return [
  //     this.getTileFrame(x, y),
  //     this.getItemFrame(x, y),
  //     this.getActorFrame(x, y)
  //   ];
  // }

  // /**
  //  * Return the name of the top item that can be found at the given position.
  //  *
  //  * @param {*} x The x coordinate of the tile.
  //  * @param {*} y The y coordinate of the tile.
  //  * @returns The name of top item found at the tile.
  //  * @memberof SimplexMap
  //  */
  // getItemFrame(x, y) {

  //   // Get the items at the given position.
  //   let items = this.getItems(x, y);

  //   // If there are items.
  //   if (items) {

  //     // Return the frame name of the first item that has one.
  //     return items.find(item => item.frame !== undefined).frame;
  //   }
  // }

  // /**
  //  * Return the items that can be found at the given position.
  //  *
  //  * @param {*} x The x coordinate of the tile.
  //  * @param {*} y The y coordinate of the tile.
  //  * @returns The list of items found at the tile or an empty list.
  //  * @memberof SimplexMap
  //  */
  // getItems(x, y) {

  //   // Return the list of items based on the given position.
  //   return this.items[x + ',' + y] || [];
  // }

  /**
   * Creates the tile at the given position and optionally a set of items or a
   * moster.
   *
   * @static
   * @param {number} x The x coordinate of the tile.
   * @param {number} y The y coordinate of the tile.
   * @memberof WorldMap
   */
  static createTerrain(x, y) {
    const terrainNoiseValues = WorldMap.config.layers.map(
        ({name, octaves}) =>
          octaves.reduce((value, {amplitude, frequency}) =>
            value + Math.pow(2, amplitude) * WorldMap.terrainNoises.get(
                name,
            ).get(
                x * Math.pow(2, frequency),
                y * Math.pow(2, frequency),
            ),
          0,
          ) / octaves.reduce((value, {amplitude}) =>
            value + Math.pow(2, amplitude),
          0,
          ),
    );
    WorldMap.terrain.set(
        `${x},${y}`,
        WorldMap.getTerrainName(terrainNoiseValues),
    );
    const items = WorldMap.getItems(x, y);
    if (items) {
      WorldMap.items.set(`${x},${y}`, items);
    }
    const actorNoiseValue = WorldMap.actorNoise.get(x, y);
    if (actorNoiseValue > 0.9) {
      WorldMap.actors.push(WorldMap.getActor(x, y));
    }
  }

  /**
   * Returns the name of a terrain on the given layer based on the related
   * value of the list of noise values.
   *
   * @static
   * @param {array} terrainNoiseValues A list of noise values for each layer.
   * @param {string} [parentTerrainName] The name of the parent terrain.
   * @param {number} [layerIndex=0] The index of the parent terrain's layer.
   * @return {string} The name of the terrain.
   * @memberof WorldMap
   */
  static getTerrainName(terrainNoiseValues, parentTerrainName, layerIndex = 0) {
    const parentTerrains = WorldMap.config.layers[layerIndex].terrains;
    parentTerrainName = parentTerrainName || Object.values(parentTerrains)[0];
    const parentTerrain = parentTerrains[parentTerrainName];
    let terrainName = parentTerrain[Object.keys(parentTerrain).find(
        (limit) => limit > terrainNoiseValues[layerIndex],
    )];
    const terrains = WorldMap.config.layers[layerIndex + 1].terrains;
    if (terrains.hasOwnProperty(terrainName)) {
      terrainName = WorldMap.getTerrainName(
          terrainNoiseValues,
          terrainName,
          layerIndex + 1,
      );
    }
    return terrainName;
  }

  /**
   *
   *
   * @static
   * @param {*} x
   * @param {*} y
   * @return {*}
   * @memberof WorldMap
   */
  static getItems(x, y) {
    const itemNoiseValue = WorldMap.itemNoise.get(x, y);
    // if (itemNoiseValue < 0.997) {
    //   return null;
    // }
    const itemTypeIndex = WorldMap.itemNoise.get(x, y);

  //   let itemName = items[ROT.RNG.getUniformInt(0, items.length - 1)];

  //   if (n > 0.997) {
  //     if (
  //       tileName === 'sand' || 
  //       tileName === 'stoneFloor' || 
  //       tileName === 'grass' || 
  //       tileName === 'redFlower' || 
  //       tileName === 'yellowFlower' ||
  //       tileName === 'dirt' ||
  //       tileName === 'gravel' ||
  //       tileName === 'ford') {
  //         let item = this.scene.itemTypes[itemName];
  //         item.frame = itemName;
  //         this.putItem(x, y, [item]);
  //         return;
  //     }
  //   }
  //   let enemies = {
  //     redFlower: n > 0 ? 'zombie' :  '',
  //     yellowFlower: n > 0 ? 'skeleton' : '',
  //     bush: n > 0.5 ? 'hobgoblin' : '',
  //     gravel: n > 0.7 ? 'troll' : (n > 0.5 ? 'goblin' : ''),
  //     ford: n > 0.7 ? 'orchArcher' : (n > 0.5 ? 'orch' : ''),
  //     sand: n > 0.9 ? 'magician' : (n > 0.85 ? 'monk' : (n > 0.8 ? 'warrior' : '')),
  }
}
WorldMap.terrain = new Map();
WorldMap.terrainNoises = new Map();
WorldMap.items = new Map();
WorldMap.itemNoise = new Simplex;
WorldMap.actors = [];
WorldMap.actorNoise = new Simplex;

