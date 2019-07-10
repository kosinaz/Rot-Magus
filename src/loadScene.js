class LoadScene extends Phaser.Scene {
  constructor() {
    super('LoadScene');
  }
  preload() {
    this.cameras.main.setBackgroundColor('#000000');
    this.add.text(400, 250, 'Traversing Hyperspace...');
    let stars = [];
    for (let i = 0; i < 5; i += 1) {
      stars.push(this.add.graphics());
      stars[i].x = 487 + ~~(Math.random() * 50);
      stars[i].y = 280 + ~~(Math.random() * 50);
    }
    let addDot = function (graphics, color) {
      graphics.lineStyle(1, color, 1);
      graphics.lineBetween(3, 2, 3, 3);
    }
    let addSmallCross = function (graphics, color) {
      graphics.lineStyle(1, color, 1);
      graphics.lineBetween(3, 1, 3, 4);
      graphics.lineBetween(1, 2, 4, 2);
    }
    let addBigCross = function (graphics, color) {
      graphics.lineStyle(1, color, 1);
      graphics.lineBetween(3, 0, 3, 5);
      graphics.lineBetween(0, 2, 5, 2);
    }
    addDot(stars[0], 0x808080);
    addSmallCross(stars[1], 0x808080);
    addDot(stars[1], 0xe0e0e0);
    addBigCross(stars[2], 0x808080);
    addSmallCross(stars[2], 0xe0e0e0);
    addSmallCross(stars[3], 0x808080);
    addDot(stars[3], 0xe0e0e0);
    addDot(stars[4], 0x808080);
    this.time.addEvent({
      delay: 150,
      callback: function () {
        for (let i = 0; i < 4; i += 1) {
          stars[i].x = stars[i + 1].x;
          stars[i].y = stars[i + 1].y;
        }     
        stars[4].x = 487 + ~~(Math.random() * 50);
        stars[4].y = 280 + ~~(Math.random() * 50);
      },
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