class InfiniteScene extends Phaser.Scene {
  constructor() {
    super('InfiniteScene');
  }
  create() {

    // generate a map based on simplex noise
    const map = new SimplexMap(this, 'tiles');

    // draw all the tiles currently on the screen
    this.draw = function () {
      for (let i = 0; i < 45; i += 1) {
        for (let j = 0; j < 29; j += 1) {

          // draw the tile
          map.addTile(
            /*16 + */i - ~~(this.cameras.main.x / 24), 
            /*8 + */j - ~~(this.cameras.main.y / 21)
          );
        }
      }
      //console.log(~~this.cameras.main.x, ~~this.cameras.main.y);
    }

    this.draw();
    this.map = map;
    
  }
}