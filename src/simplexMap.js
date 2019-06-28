class SimplexMap {
  constructor(scene, tilesetImage) {

    // the scene where the map is displayed
    this.scene = scene;

    // the key of the image this map will use to render its tiles
    this.tilesetImage = tilesetImage;

    // the Simplex noise that serve as the base of the map
    this.noise = new ROT.Noise.Simplex();

    // the container of visible tiles of this map
    this.tiles = this.scene.add.container();
    
    // the container of the invisible, unused tiles of this map
    this.hiddenTiles = this.scene.add.container();

    this.map = {};
  }

  // the core of the script: tiles are added from the pool or created on the fly
  addTile(x, y) {

    // the tile we add or create
    let tile;

    // the key of the tile that should be displayed at the given position
    let tileName;
    
    // the enemy generated at the given position
    let enemy;

    // the noise that determines the probability of the enemy generation
    let n = this.noise.get(x, y);

    // if this is the first time a tile is set to be added at this position
    if (this.map[x + ',' + y] === undefined) {      

      // generate the key of the tile
      tileName = this.getTileNameAt(x, y);

      // save the key of the tile at the given position for further use
      this.map[x + ',' + y] = {
        name: tileName
      }

      if (tileName === 'redFlower' && n < -0.05) {
        enemy = new Actor(this.scene, x, y, 'tiles', this, actors.zombie);
      } else if (tileName === 'yellowFlower' && n > 0.05) {
        enemy = new Actor(this.scene, x, y, 'tiles', this, actors.skeleton);
      } else if (tileName === 'bush' && n < -0.025) {
        enemy = new Actor(this.scene, x, y, 'tiles', this, actors.hobgoblin);
      } else if (tileName === 'gravel' && n < -0.7) {
        enemy = new Actor(this.scene, x, y, 'tiles', this, actors.goblin);
      } else if (tileName === 'gravel' && n > 0.8) {
        enemy = new Actor(this.scene, x, y, 'tiles', this, actors.troll);
      } else if (tileName === 'ford' && n > 0.4) {
        enemy = new Actor(this.scene, x, y, 'tiles', this, actors.orch);
      } else if (tileName === 'ford' && n > 0.3) {
        enemy = new Actor(this.scene, x, y, 'tiles', this, actors.orchArcher);
      }
      if (enemy) {
        enemies.push(enemy); 
        enemy.name 
          += ' ' + enemies.filter(e => e.tileName === enemy.tileName).length;
        enemy.visible = true;
        console.log(enemy.name);
      }

    // if this tile has been requested before
    } else {

      // if the image of the tile is still displayed
      if (this.map[x + ',' + y].image) {

        // keep the tile as is
        return this.map[x + ',' + y].image;
      }

      // else get the previously saved key of the tile
      tileName = this.map[x + ',' + y].name;
    }
    
    // if there is any unused tile
    if (this.hiddenTiles.length) {
      
      // get the first unused tile
      tile = this.hiddenTiles.first;

      // add the tile to the list of tiles to be displayed
      this.tiles.add(tile);

      // remove the tile from the list of unused tiles
      this.hiddenTiles.remove(tile);

      // make the previously unused tile look like the one to be displayed
      tile.setFrame(tileName);

      // save the image of the tile at its new position
      this.map[x + ',' + y].image = tile;
      
      // move it to the new position
      tile.x = x * 24 + 12;
      tile.y = y * 21 + 11;
      tile.tileX = x;
      tile.tileY = y;
      
      // activate it
      tile.active = true;
      
      // show it
      tile.visible = true;
      
    // if there is no unused tile
    } else {
      
      // display the image of the tile
      tile = this.scene.add.image(x * 24 + 12, y * 21 + 11, this.tilesetImage, tileName);
      tile.tileX = x;
      tile.tileY = y;

      // save the image of the tile at the defined position
      this.map[x + ',' + y].image = tile;
      
      // add the tile to the container of tiles
      this.tiles.add(tile);
    }

    return tile;
  }
  
  // hide all tiles out of camera bounds
  hideOutOfBounds() {
    
    // iterate through all tiles    
    this.tiles.iterate(function (tile) {
      
      if (tile.x < -this.scene.cameras.main.x - 24
        || tile.x > -this.scene.cameras.main.x + 43 * 24
        || tile.y < -this.scene.cameras.main.y - 21
        || tile.y > -this.scene.cameras.main.y + 28 * 21
        ) {

        this.hide(tile);
        
      }

    }, this);
  }

  hide(tile) {
    this.map[(tile.x - 12) / 24 + ',' + (tile.y - 11) / 21].image = null;

    this.hiddenTiles.add(tile);

    this.tiles.remove(tile);

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