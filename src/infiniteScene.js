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
    const noise2 = new ROT.Noise.Simplex();
    const noise3 = new ROT.Noise.Simplex();

    // set the start position
    let x = 0;
    let y = 0;
    let f = 96;
    let f2 = 16;
    let z = 1;
    let h = true;
    let t = true;
    let r = true;

    // redraw all the tiles on the screen
    let redraw = function (scene) {

      // clear the screen
      scene.add.displayList.removeAll();

      // iterate through all tiles on the screen
      for (let j = 0; j < 28; j += 1) {
        for (let i = 0; i < 43; i += 1) {

          // get a position-based low-frequency random value between -1 and 1
          // then translate it to a height value between 0 and 2,
          let height = noise.get((x + i) / f, (y + j) / f) * 4;
          if (h) height = height + noise.get((x + i) / f2, (y + j) / f2);
          let roads = noise2.get((x + i) / f, (y + j) / f);
          let trees = noise3.get((x + i), (y + j));

          // set the tile as grass by default
          let tileIndex = 0;
          if (t) tileIndex = ~~(trees * 3) < 0 ? 17 : tileIndex;
          tileIndex = ~~(height) === 0 ? 21 : tileIndex;
          if (r) tileIndex = ~~(roads * 8) === 0 ? 0 : tileIndex;
          if (r) tileIndex = ~~(roads * 48) === 0 ? 4 : tileIndex;
          scene.add.image(i * 24, j * 21, 'tilesetImage', tileIndex);
        }
      }

      // draw the player
      scene.add.image(22 * 24, 14 * 21, 'tilesetImage', 25);
    };

    // draw the screen
    this.cameras.main.setZoom(z);
    redraw(this);

    // set the movement keys
    this.input.keyboard.on('keydown', function (event) {

      // set the left arrow
      if (event.key === 'ArrowLeft') {

        // move the player left
        x -= 1;
        console.log(x);
        
        // set the right arrow
      } else if (event.key === 'ArrowRight') {
        
        // move the player right
        x += 1;
        console.log(x);
        
        // set the up arrow
      } else if (event.key === 'ArrowUp') {
        
        // move the player up
        y -= 1;
        console.log(y);
        
        // set the down arrow
      } else if (event.key === 'ArrowDown') {
        
        // move the player down
        y += 1;
        console.log(y);

      } else if (event.key === 'PageUp') {
        
        // move the player up
        f2 -= 1;
        console.log(f2);
        
        // set the down arrow
      } else if (event.key === 'PageDown') {
        
        // move the player down
        f2 += 1;
        console.log(f2);
      } else if (event.key === 'Home') {
        
        // move the player up
        z /= 2;
        console.log(z);
        
        // set the down arrow
      } else if (event.key === 'End') {
        
        // move the player down
        z *= 2;
        console.log(z);

      } else if (event.key === 't') {
        
        // move the player up
        t = !t;
        console.log(t);
        
        // set the down arrow
      } else if (event.key === 'r') {
        
        // move the player down
        r = !r;
        console.log(r);

      } else if (event.key === 'h') {
        
        // move the player down
        h = !h;
        console.log(h);

      }
      console.log(event.key);

      // redraw the screen after every movement
      this.cameras.main.setZoom(z);
      redraw(this);
    }.bind(this));
  }
}