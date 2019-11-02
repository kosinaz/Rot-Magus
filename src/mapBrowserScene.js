class MapBrowserScene extends Phaser.Scene {
  constructor() {
    super('MapBrowserScene');
  }

  create() {
    //ROT.RNG.setSeed('ja');

    // Create a map based on Simplex noise. Unique to the game scene and referred to by several functions of the scene.
    this.map = new SimplexMap(this, 'tiles', this.cache.json.get('mapConfig'));
    this.graphics = this.add.graphics();
    this.input.on('pointerup', function () {
      console.log('restart');
      // this.scene.restart();
      this.scene.start('MapBrowserScene');
    }.bind(this));
    this.draw();
  }
  draw() {
    for (let x = 0; x < 1024; x += 1) {
      for (let y = 0; y < 576; y += 1) {
        this.graphics.fillStyle({
          waterTile: color.darkblue,
          ford: color.blue,
          marsh: color.green,
          grass: color.darkgreen,
          tree: color.darkbrown,
          bush: color.darkgreen,
          gravel: color.darkgray,
          mountain: color.gray,
          redFlower: color.red,
          portalTile: color.white,
          stoneFloor: color.darkgray,
          gate: color.lightgray,
          stoneWall: color.gray,
          dirt: color.brown,
          sand: color.yellow,
          palmTree: color.green
        }[this.map.getTileNameAt(x - 512, y - 288)]);
        this.graphics.fillPoint(x, y);
      }
    }
  }
}