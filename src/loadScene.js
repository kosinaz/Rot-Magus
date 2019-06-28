class LoadScene extends Phaser.Scene {
  constructor() {
    super('LoadScene');
  }
  preload() {

    this.cameras.main.setBackgroundColor('#000000');

    let hourglass = this.add.text(400, 200, 'Loading', {
      fontSize: '32px',
    });
    hourglass.data = 0;

    this.time.addEvent({
      delay: 500,
      callback: function () {
        hourglass.data = (hourglass.data + 1) % 4;
        hourglass.text = 'Loading' + ['', '.', '..', '...'][hourglass.data];
      },
      callbackScope: this,
      loop: true
    });

    this.load.atlas('tiles', 'assets/images/tiles.png', 'assets/images/tiles.json');

    this.load.image('ingame', 'assets/images/gui/ingame.png');
    this.load.json('actors', 'data/actors.json');
    this.load.json('items', 'data/items.json');
    this.load.json('gui', 'data/gui.json');
  };

  create() {
    actors = this.cache.json.get('actors');
    this.scene.start('InfiniteScene');
    this.scene.start('MenuScene');
  }
}