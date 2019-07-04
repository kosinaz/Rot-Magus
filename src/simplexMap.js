class SimplexMap {
  constructor(scene, tilesetImage) {

    // The scene where the map is displayed.
    this.scene = scene;

    // The key of the image this map will use to render its tiles.
    this.tilesetImage = tilesetImage;

    // The Simplex noise that serve as the base of the map.
    this.noise = new ROT.Noise.Simplex();

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
    
    // the enemy generated at the given position
    //let enemy;

    // the noise that determines the probability of the enemy generation
    //let n = this.noise.get(x, y);

    // If this is the first time a tile is set to be added at this position.
    if (this.tiles[x + ',' + y] === undefined) {      

      // Generate the key of the tile.
      tileName = this.getTileNameAt(x, y);

      // Save the key of the tile at the given position for later use, when this tile becames visible again, and the original image of this tile has been reused elsewere since then. Saving this value means that no tile name of a specific position will be requested from the simplex map more than once.
      this.tiles[x + ',' + y] = {
        name: tileName
      }
    }

    // If the image of the tile is not displayed at the given position.
    if (this.tiles[x + ',' + y].image === undefined) {

      // Create the image of the tile.
      tile = this.scene.add.image(x * 24 + 12, y * 21 + 11, this.tilesetImage, this.tiles[x + ',' + y].name);

      // Save the image of the tile at the given position for later use during every upcoming update when this tile is still visible. 
      this.tiles[x + ',' + y].image = tile;

      // Save its tile position to make the translation to tile positions easier when this tile is interacted with.
      this.tiles[x + ',' + y].image.tileX = x;
      this.tiles[x + ',' + y].image.tileY = y;

      // Set the tile to start the show animation from a full transparency.
      this.tiles[x + ',' + y].image.alpha = 0;

      // Add the tile to the container of terrain tiles to show it under the actor.
      this.terrain.add(this.tiles[x + ',' + y].image)

      // Set the tile to show in the current update.
      this.tiles[x + ',' + y].toShow = true;
    }

    // Set the tile not to hide in the current update.
    this.tiles[x + ',' + y].toHide = false;
    
    // Return the just created or already displayed tile. 
    return this.tiles[x + ',' + y].image;

      // if (tileName === 'redFlower' && n < -0.05) {
      //   enemy = new Actor(this.scene, x, y, 'tiles', this, actors.zombie);
      // } else if (tileName === 'yellowFlower' && n > 0.05) {
      //   enemy = new Actor(this.scene, x, y, 'tiles', this, actors.skeleton);
      // } else if (tileName === 'bush' && n < -0.025) {
      //   enemy = new Actor(this.scene, x, y, 'tiles', this, actors.hobgoblin);
      // } else if (tileName === 'gravel' && n < -0.7) {
      //   enemy = new Actor(this.scene, x, y, 'tiles', this, actors.goblin);
      // } else if (tileName === 'gravel' && n > 0.8) {
      //   enemy = new Actor(this.scene, x, y, 'tiles', this, actors.troll);
      // } else if (tileName === 'ford' && n > 0.4) {
      //   enemy = new Actor(this.scene, x, y, 'tiles', this, actors.orch);
      // } else if (tileName === 'ford' && n > 0.3) {
      //   enemy = new Actor(this.scene, x, y, 'tiles', this, actors.orchArcher);
      // }
      // if (enemy) {
      //   enemies.push(enemy); 
      //   enemy.name 
      //     += ' ' + enemies.filter(e => e.tileName === enemy.tileName).length;
      //   console.log(enemy.name);
      // }  
  }
  
  // hide all tiles out of camera bounds
  hideOutOfBounds() {
    
    // iterate through all tiles    
    this.visibleTiles.iterate(function (tile) {
      
      if (tile.x < -this.scene.cameras.main.x - 24
        || tile.x > -this.scene.cameras.main.x + 43 * 24
        || tile.y < -this.scene.cameras.main.y - 21
        || tile.y > -this.scene.cameras.main.y + 28 * 21
        ) {

        this.hide(tile);
        
      }

    }, this);
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

    // set the key of the tile within the tilesetImage as grass by default
    let tileName = 'grass';

    // set a position-based low-frequency noise 
    // increase its amplitude to narrow down its median to a few tiles 
    // round it to the nearest integer
    // return the lowest values
    if (~~(this.noise.get((x) / 96, (y) / 96) * 8) < -6) {

      let n = this.noise.get(x, y);

      if (!~~(this.noise.get((x) / 48, (y) / 48) * 16)) {

        if (n > -0.6 && n < 0.6) {
          tileName = 'ford';
        } else if (n < -0.7) {
          tileName = 'bush';
        } else if (n > 0.7) {
          tileName = 'marsh';
        } else {
          tileName = 'grass';
        }

      } else {

        if (n > -0.6 && n < 0.6) {
          tileName = 'water';
        } else if (n < -0.8) {
          tileName = 'ford';
        } else if (n > 0.8) {
          tileName = 'marsh';
        } else if (n > 0.75) {
          tileName = 'tree';
        } else {
          tileName = 'grass';
        }
      }

      // set a position-based low-frequency noise 
      // increase its amplitude to narrow down its median to a few tiles 
      // round it to the nearest integer
      // return the median
    } else if (!~~(this.noise.get((x) / 96, (y) / 96) * 8)) {

      if (!~~(this.noise.get((x) / 48, (y) / 48) * 16)) {

        // set the tile as gravel
        tileName = 'gravel';
       
      } else {

        // set the tile as rock
        tileName = 'mountain';
      }

      // set a position-based low-frequency noise 
      // increase its amplitude to narrow down its median to one tile 
      // round it to the nearest integer
      // return the median
    } else if (!~~(this.noise.get((x) / 48, (y) / 48) * 16)) {


      // set the tile as grass
      tileName = 'grass';

      // set a position-based noise 
      // increase its amplitude
      // round it to the nearest integer
      // return the median
    } else if (!~~(this.noise.get(x, y) * 16)) {

      // set the tile as tree or bush or flowers
      let n = this.noise.get(x, y);
      if (n > -0.001 && n < 0.001) {
        tileName = 'tree';
      } else if (n < -0.03) {
        tileName = 'redFlower';
      } else if (n > 0.03) {
        tileName = 'yellowFlower';
      } else {
        tileName = 'bush';    
      }
    }
    return tileName;
  }
}