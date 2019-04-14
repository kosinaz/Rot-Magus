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

          // get a position-based random value between -1 and 1
          // then translate it to a height value between 0 and 2,
          let heightLevel = noise.get((x + i) / 64, (y + j) / 64) + 1;

          // set the sea level as the bottom sixth layer
          // and the mountain level as the top sixth layer
          // then set the rest as grassland
          let tileIndex = [12, 0, 0, 0, 0, 21][~~(heightLevel * 3)];

          // draw the tile based on the height level
          scene.add.image(i * 24, j * 21, 'tilesetImage', tileIndex)
            .setAlpha(heightLevel / 2);
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