class SeedBrowserScene extends Phaser.Scene {
  constructor() {
    super('SeedBrowserScene');
  }

  create() {
    game.seed = ROT.RNG.getUniformInt(0, 1000000);
    ROT.RNG.setSeed(game.seed);

    // Create a map based on Simplex noise. Unique to the game scene and referred to by several functions of the scene.
    this.map = new SimplexMap(this, 'tiles', this.cache.json.get('mapConfig'));
    this.graphics = this.add.graphics();
    for (let x = 0; x < 1024; x += 1) {
      for (let y = 0; y < 576; y += 1) {
        this.graphics.fillStyle({
          waterTile: color.darkblue,
          ford: color.blue,
          marsh: color.green,
          grass: color.darkgreen,
          tree: color.darkbrown,
          bush: color.green,
          gravel: color.darkgray,
          mountain: color.gray,
          redFlower: color.red,
          yellowFlower: color.yellow,
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
    new TextButton({
      onPointerUp: function () {
        this.scene.start('SeedBrowserScene');
      }.bind(this),
      origin: 0,
      scene: this,
      text: 'Seed: ' + ROT.RNG.getSeed() + ' (Click to change)',
      x: 10,
      y: 10
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('GameScene');
        this.scene.start('GUIScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Start new game with this seed',
      x: 512,
      y: 540
    });
  }
}