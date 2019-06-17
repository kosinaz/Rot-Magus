class LoadScene extends Phaser.Scene {
  constructor() {
    super('LoadScene');
  }
  preload = function () {

    this.cameras.main.setBackgroundColor('#000000');

    let hourglass = this.add.text(512, 200, '⏳', {
      fontSize: '64px',
    }).setOrigin(0.5);
    hourglass.data = 0;

    this.time.addEvent({
      delay: 500,
      callback: function () {
        hourglass.data = (hourglass.data + 1) % 2;
        hourglass.text = '⏳⌛' [hourglass.data];
      },
      callbackScope: this,
      loop: true
    });

    // preload the tileset image that contains all the tiles of the map
    this.load.spritesheet('tilesetImage', 'assets/images/tiles.png', {
      frameWidth: 24,
      frameHeight: 21
    });

    this.load.image('ingame', 'assets/images/gui/ingame.png');
    this.load.json('actors', 'data/actors.json');
    this.load.json('items', 'data/items.json');
    this.load.json('gui', 'data/gui.json');
  };

  create() {
    this.scene.start('InfiniteScene');
    this.scene.start('MenuScene');
  }
}