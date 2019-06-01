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
          let tileIndex = 0;
          if (!~~(noise.get((x + i) / 48, (y + j) / 48) * 16)) {
            tileIndex = 4;
          } else if (!~~(noise.get((x + i) / 96, (y + j) / 96) * 8)) {
            tileIndex = 21;
          } else if (!~~(noise.get(x + i, y + j) * 32)) {
            tileIndex = 17;
          }
          scene.add.image(i * 24, j * 21, 'tilesetImage', tileIndex);
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