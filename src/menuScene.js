class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  create() {
    console.log(1, 1>>1);
    console.log(2, 2>>1);
    console.log(3, 3>>1);
    console.log(4, 4>>1);
    console.log(5, 5>>1);
    console.log(6, 6>>1);
    game.seed = ROT.RNG.getUniformInt(0, 1000000);
    ROT.RNG.setSeed(game.seed);
    this.cameras.main.setBackgroundColor('#616161');
    this.map = new SimplexMap(this, 'tiles', this.cache.json.get('mapConfig'));
    for (let x = 0; x < 44; x += 1) {
      for (let y = 0; y < 28; y += 1) {
        this.add.image(x * 24 - 12, y * 21, 'tiles', this.map.getTileNameAt(x - 21, y - 13));
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
      text: 'New game',
      x: 512,
      y: 200
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('SeedBrowserScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Map browser',
      x: 512,
      y: 250
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('ScoreScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Hall of fame',
      x: 512,
      y: 300
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('SettingScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Settings',
      x: 512,
      y: 350
    });
  }
}