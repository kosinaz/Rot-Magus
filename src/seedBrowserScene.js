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
        this.scene.start('GameScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Start new game with seed: ' + ROT.RNG.getSeed(),
      x: 512,
      y: 440
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.restart();
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Change seed',
      x: 512,
      y: 490
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.scene.start('MenuScene');
        this.scene.scale.off('leavefullscreen');
      },
      origin: 0.5,
      scene: this,
      text: 'Back to main menu',
      x: 512,
      y: 540
    });
  }
}