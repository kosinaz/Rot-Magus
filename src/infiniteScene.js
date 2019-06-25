class InfiniteScene extends Phaser.Scene {
  constructor() {
    super('InfiniteScene');
  }
  create() {

    // generate a map based on simplex noise
    const map = new SimplexMap(this, 'tiles');

    // draw all the tiles currently on the screen
    this.draw = function () {
      for (let i = -1; i < 44; i += 1) {
        for (let j = -1; j < 29; j += 1) {
          
          // draw the tile
          map.addTile(
            i - this.cameras.main.x / 24, j - this.cameras.main.y / 21
          );
          }
        }
      }
    this.map = map;
    
  }
}