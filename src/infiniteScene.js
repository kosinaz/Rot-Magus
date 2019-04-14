class InfiniteScene extends Phaser.Scene {
  constructor() {
    super('InfiniteScene');
  }
  preload() {

    // preload the tileset image that contains all the tiles of the map
    this.load.spritesheet('tilesetImage', 'assets/images/tiles.png', {
      frameWidth: 24,
      frameHeight: 21
    });
  }
  create() {

    // initialize a simplex noise
    const noise = new ROT.Noise.Simplex();

    // set the start position
    let x = 0;
    let y = 0;

    // redraw all the tiles on the screen
    let redraw = function (scene) {

      // clear the screen
      scene.add.displayList.removeAll();

      // iterate through all tiles on the screen
      for (let j = 0; j < 28; j += 1) {
        for (let i = 0; i < 43; i += 1) {

          // get a position-based low-frequency random value between -1 and 1
          // then translate it to a height value between 0 and 2,
          let height = noise.get((x + i) / 64, (y + j) / 64) + 1;

          // sort the current height to one of the twelve height levels
          let heightLevel = ~~(height * 6);

          // get a position based high-frequency random value between -1 and 1
          // to determine the chance of placing down a special tile
          let specialChance = noise.get((x + i), (y + j));

          // set the tile as grass by default
          let tileIndex = 0;

          // set the first level as deep lake
          if (heightLevel === 0) {

            // set all the deep lake tiles as water
            tileIndex = 12;

          // set the 2nd level as shallow lake
          } else if (heightLevel === 1) {

            // check if the special chance rate of the tile is in the top 5%
            if (specialChance > 0.9) {
              
              // set 5% of the lake tiles as lily pads
              tileIndex = 13;

            // check if the special chance rate of the tile is in the bottom 5%
            } else if (specialChance < -0.9) {
            
            // set other 5% of the lake tiles as rocks
            tileIndex = 11;

            // set the default lake tile
            } else {

              // set the rest of the lake tiles as water
              tileIndex = 12;
            }

          // set the 3rd and 4th level as grassland
          } else if (heightLevel === 2 || heightLevel === 3) {

            // check if the special chance rate of the tile is in the top 5%
            if (specialChance > 0.9) {
              
              // set 5% of the grassland as trees
              tileIndex = 17;

            // check if the special chance rate of the tile is in the bottom 5%
            } else if (specialChance < -0.9) {
            
            // set other 5% of the grassland as bush
            tileIndex = 16;

            // set the default grassland tile
            } else {

              // set the rest of the grassland as grass
              tileIndex = 0;
            }
          
          // set the 5th and 6th and 7th level as forest
          } else if (heightLevel === 4
            || heightLevel === 5
            || heightLevel === 6) {

            // check if the special chance rate of the tile is in the top 20%
            if (specialChance > 0.6) {

              // set 20% of the forest as trees
              tileIndex = 17;

            // check if the special chance rate of the tile is in the bottom 20%
            } else if (specialChance < -0.6) {

              // set other 20% of the forest as trees
              tileIndex = 17;

              // set the default forest tile
            } else {

              // set the rest of the forest as grass
              tileIndex = 0;
            }

          // set the 8th and 9th level as high land
          } else if (heightLevel === 7 || heightLevel === 8) {

            // check if the special chance rate of the tile is in the top 2.5%
            if (specialChance > 0.95) {

              // set 2.5% of the high land as tree
              tileIndex = 17;

            // check if the special chance rate of the tile is in the next 2.5%
            } else if (specialChance > 0.9) {

              // set 2.5% of the high land as bush
              tileIndex = 16;

            // check if the special chance rate of the tile is in the last 2.5%
            } else if (specialChance < -0.95) {

              // set other 2.5% of the high land tiles as red flowers
              tileIndex = 1;

            // check if the special chance rate of the tile is in the next 2.5%
            } else if (specialChance < -0.9) {

              // set other 2.5% of the high land tiles as yellow flowers
              tileIndex = 2;

            // set the default high land tile
            } else {

              // set the rest of the high land tiles as grass
              tileIndex = 0;
          }

          // set the 10th level as bottom hills
          } else if (heightLevel === 9) {

            // check if the special chance rate of the tile is in the top 60%
            if (specialChance > -0.3) {

              // set 60% of the bottom hill tiles as grass
              tileIndex = 0;

            // set the default bottom hill tile as dirt
            } else {

              // set the rest of the bottom hill tiles as dirt
              tileIndex = 4;
            }
          
          // set the 11th level as top hills
          } else if (heightLevel === 10) {

            // check if the special chance rate of the tile is in the top 20%
            if (specialChance > 0.6) {

              // set 20% of the hill tiles as mountain rocks
              tileIndex = 21;

            // check if the special chance rate of the tile is in the second 20%
            } else if (specialChance > 0.2) {

              // set other 20% of the hill tiles as pebbles
              tileIndex = 5;

            // set the default hill tile
            } else {

              // set the rest of the hill tiles as dirt
              tileIndex = 4;
            }

          // set the last level as mountain
          } else if (heightLevel === 11) {
            
            // set every tile of the level as mountain rock
            tileIndex = 21;
          }

          // draw the tile based on the height level
          scene.add.image(i * 24, j * 21, 'tilesetImage', tileIndex)
            .setAlpha(height / 4 + 0.5);
        }
      }

      // draw the player
      scene.add.image(22 * 24, 14 * 21, 'tilesetImage', 25);
    };

    // draw the screen
    redraw(this);

    // set the movement keys
    this.input.keyboard.on('keydown', function (event) {

      // set the left arrow
      if (event.key === 'ArrowLeft') {

        // move the player left
        x -= 1;
        
        // set the right arrow
      } else if (event.key === 'ArrowRight') {
        
        // move the player right
        x += 1;
        
        // set the up arrow
      } else if (event.key === 'ArrowUp') {
        
        // move the player up
        y -= 1;
        
        // set the down arrow
      } else if (event.key === 'ArrowDown') {
        
        // move the player down
        y += 1;
      }

      // redraw the screen after every movement
      redraw(this);
    }.bind(this));
  }
}