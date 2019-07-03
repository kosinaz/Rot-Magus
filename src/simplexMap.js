class SimplexMap {
  constructor(scene, tilesetImage) {

    // The scene where the map is displayed.
    this.scene = scene;

    // The key of the image this map will use to render its tiles.
    this.tilesetImage = tilesetImage;

    // The Simplex noise that serve as the base of the map.
    this.noise = new ROT.Noise.Simplex();

    // The list of visible tiles of this map.
    this.visibleTiles = [];
    
    // The list of the invisible, unused tiles of this map.
    this.hiddenTiles = [];

    // The collection of positions containing a tile image and a unique key that determines the attributes of that tile and the image to be displayed in case the previously used image object of this tile has been reused elsewhere while this tile was hidden.
    this.map = {};

    // The container that will keep all the terrain tiles together, displayed under the items and actors.
    this.terrainLayer = this.scene.add.container();    

    // The container that will keep all the items together, displayed over the terrain tiles and under the actors.
    this.itemLayer = this.scene.add.container();   
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
    if (this.map[x + ',' + y] === undefined) {      

      // Generate the key of the tile.
      tileName = this.getTileNameAt(x, y);

      // Save the key of the tile at the given position for later use.
      this.map[x + ',' + y] = {
        name: tileName
      }

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

    // If this tile has been requested before it already has a name and maybe even the correct image.
    } else {

      // If the image of the tile is still displayed.
      if (this.map[x + ',' + y].image) {

        // Keep the tile as is.
        return this.map[x + ',' + y].image;
      }

      // Else get the previously saved key of the tile.
      tileName = this.map[x + ',' + y].name;
    }
    
    // If there is any unused tile.
    if (this.hiddenTiles.length) {
      
      // Get the first unused tile.
      tile = this.hiddenTiles[0];

      // Make the previously unused tile look like the one to be displayed.
      tile.setFrame(tileName);

      // Add the tile to the list of tiles to be displayed.
      this.visibleTiles.push(tile);

      // Remove the tile from the list of unused tiles.
      this.hiddenTiles.splice(
        this.hiddenTiles.indexOf(tile), 1
      );      

      // Save the image of the tile at its new position.
      this.map[x + ',' + y].image = tile;
      
      // Move it to the new position.
      tile.x = x * 24 + 12;
      tile.y = y * 21 + 11;

      // Save its tile position.
      tile.tileX = x;
      tile.tileY = y;
      
      // Activate it.
      tile.active = true;
      
      // Show it.
      tile.visible = true;
      
    // If there is no unused tile.
    } else {
      
      // Display the image of the tile.
      tile = this.scene.add.image(x * 24 + 12, y * 21 + 11, this.tilesetImage, tileName);

      // Add the tile to the terrain layer to display it under the actors and items.
      this.scene.map.terrainLayer.add(tile);

      // Save its tile position.
      tile.tileX = x;
      tile.tileY = y;

      // Save the image of the tile at the defined position.
      this.map[x + ',' + y].image = tile;
      
      // Add the tile to the list of visible tiles.
      this.visibleTiles.push(tile);
    }

    // Add the tile to the list of objects to show, so it can be displayed during the FOV update of the scene.
    this.scene.objectsToShow.push(tile);
    tile.alpha = 0;

    return tile;
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
    this.map[(tile.x - 12) / 24 + ',' + (tile.y - 11) / 21].image = null;

    this.hiddenTiles.push(tile);

    this.visibleTiles.splice(
      this.visibleTiles.indexOf(tile), 1
    );

    // deactive it
    tile.active = false;

    // hide it
    tile.visible = false;
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