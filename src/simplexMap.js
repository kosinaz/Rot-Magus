class SimplexMap {
  constructor(scene, tilesetImage) {

    // the scene where the map is displayed
    this.scene = scene;

    // the key of the image this map will use to render its tiles
    this.tilesetImage = tilesetImage;

    // the Simplex noise that serve as the base of the map
    this.noise = new ROT.Noise.Simplex();

    // the container of visible and invisible, unused tiles of this map
    this.tiles = this.scene.add.container();
  }

  // the core of the script: tiles are added from the pool or created on the fly
  addTile(x, y) {

    // the tile we add or create
    let tile;

    // the key of the tile that should be displayed at the given position
    let tileName = this.getTileNameAt(x, y);

    // get all the unused tiles
    let unusedTiles = this.tiles.getAll('visible', false);
    
    // if there is any unused tile
    if (unusedTiles.length) {
      
      // get the first tile that looks like the one to be displayed
      tile = unusedTiles.filter(tile => tile.frame.name === tileName)[0];

      // if there is a unused tile that looks like the one to be displayed
      if (tile) {

        // move it to the given position
        tile.x = x * 24;
        tile.y = y * 21;

        // activate it
        tile.active = true;

        // show it
        tile.visible = true;

      // if there is no unused tile that looks like the one to be displayed
      } else {

        // add the image of the tile
        tile = this.scene.add.image(x * 24, y * 21, this.tilesetImage, tileName);

        // add the tile to the container of tiles
        this.tiles.add(tile);
      }

    // if there is no unused tile
    } else {

      // add the image of the tile
      tile = this.scene.add.image(x * 24, y * 21, this.tilesetImage, tileName);

      // add the tile to the container of tiles
      this.tiles.add(tile);
    }
  }

  // hide all tiles before showing the ones that are visible currently
  hide() {
    
    // iterate through all tiles    
    this.tiles.iterate(function (tile) {
      
      // deactive it
      tile.active = false;

      // hide it
      tile.visible = false;
    });
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
      if (n > -0.01 && n < 0.01) {
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