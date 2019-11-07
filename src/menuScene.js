class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  create() {
    game.seed = ROT.RNG.getUniformInt(0, 1000000);
    ROT.RNG.setSeed(game.seed);
    this.cameras.main.setBackgroundColor('#616161');
    this.map = new SimplexMap(this, 'tiles', this.cache.json.get('mapConfig'));
    for (let x = 0; x < 44; x += 1) {
      for (let y = 0; y < 28; y += 1) {
        this.add.image(x * 24 - 12, y * 21, 'tiles', this.map.getTileNameAt(x - 21, y - 17));
      }
    }
    this.add.text(512, 100, 'ROT MAGUS', {
      fontFamily: 'title',
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    new TextButton({
      onPointerUp: function () {
        this.scene.start('GameScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Start new game',
      x: 512,
      y: 200
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('SeedBrowserScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Browse map seeds',
      x: 512,
      y: 250
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('SettingScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Settings',
      x: 512,
      y: 300
    });
  }
}