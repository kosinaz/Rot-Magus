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

    this.load.atlas('tiles', 'images/tiles.png', 'images/tiles.json');
    this.load.atlas('gui', 'images/gui.png', 'images/gui.json');
    this.load.json('actorTypes', 'data/actorTypes.json');
    this.load.json('itemTypes', 'data/itemTypes.json');
    this.load.json('guiElements', 'data/guiElements.json');
  }

  create() {
    this.scene.start('MenuScene');
  }
}