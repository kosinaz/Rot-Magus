/**
 * Represents the scene of the main menu.
 *
 * @export
 * @class MenuScene
 * @extends {Phaser.Scene}
 */
export default class MenuScene extends Phaser.Scene {
  /**
   * Creates an instance of MenuScene.
   * @memberof MenuScene
   */
  constructor() {
    // Create the MenuScene just like any Phaser scene.
    super('MenuScene');
  }

  /**
   * Creates the dynamic background and the menu points.
   *
   * @memberof MenuScene
   */
  create() {
    const seed = ROT.RNG.getUniformInt(0, Number.MAX_SAFE_INTEGER);
    console.log(seed);
    ROT.RNG.setSeed(seed);
    this.cameras.main.setBackgroundColor('#616161');
    // this.map = new SimplexMap(this, 'tiles', this.cache.json.get('mapConfig'));
    // for (let x = 0; x < 44; x += 1) {
    //   for (let y = 0; y < 28; y += 1) {
    //     this.add.image(x * 24 - 12, y * 21, 'tiles', this.map.getTileNameAt(x - 21, y - 13));
    //   }
    // }
    // this.add.text(512, 100, 'ROT MAGUS', {
    //   fontFamily: 'title',
    //   fontSize: '64px',
    //   fill: '#ff0000',
    //   stroke: '000000',
    //   strokeThickness: 8
    // }).setOrigin(0.5);
    new TextButton({
      onPointerUp: function () {
        this.scene.start('GameScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'New game',
      x: 512,
      y: 220
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('SeedBrowserScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Map browser',
      x: 512,
      y: 270
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('ScoreScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Hall of fame',
      x: 512,
      y: 320
    });
    new TextButton({
      onPointerUp: function () {
        this.scene.start('SettingScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Settings',
      x: 512,
      y: 370
    });
  }
}