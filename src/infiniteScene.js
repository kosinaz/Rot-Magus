class InfiniteScene extends Phaser.Scene {
  constructor() {
    super('InfiniteScene');
  }
  create() {

    // generate a map based on simplex noise
    const map = new SimplexMap;    
    
    this.draw = function (row) {
      for (let i = 0; i < 43; i += 1) {
        
        let tileIndex = map.getTileIndexAt(i, row);
        
        // draw the tile
        this.add.image(i * 24 + 12, row * 21 + 10, 'tilesetImage', tileIndex);
      }
    }
    
    // draw all the tiles currently on the screen
    for (let i = 0; i < 29; i += 1) {
      this.draw(i);
    }
    this.y = 28;
  }
  update() {
    this.cameras.main.scrollY += 1;
    if (this.cameras.main.scrollY % 21 === 0) {
      this.draw(++this.y);
    }
  }
}