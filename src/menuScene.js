class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  create() {
    this.bg = this.scene.get('InfiniteScene');

    this.log = this.add.text(100, 100, '');
    this.panX = ['+=24', '+=0', '-=24'][~~(Math.random() * 3)];
    this.panY = ['+=21', '+=0', '-=21'][~~(Math.random() * 3)];
    // this.panX = 0;
    // this.panY = 0;
    this.pan = function () {
      this.bg.map.hide();
      this.bg.draw();
      this.log.text = 'tiles: ' + this.bg.map.tiles.length;
      this.log.text += '\nunused: ' + this.bg.map.hiddenTiles.length;
      this.log.text += '\nmap: ' + Object.keys(this.bg.map.map).length;
      this.log.text += '\nremained: ' + this.bg.map.remained;
      this.log.text += '\nreused: ' + this.bg.map.reused;
      this.log.text += '\nnamed: ' + this.bg.map.named;
      this.log.text += '\nadded: ' + this.bg.map.added;
      this.log.text += '\nremoved: ' + this.bg.map.removed;
      this.bg.map.remained = 0;
      this.bg.map.reused = 0;
      this.bg.map.named = 0;
      this.bg.map.added = 0;
      this.bg.map.removed = 0;
      this.tweens.add({
        targets: this.bg.cameras.main,
        x: this.panX,
        y: this.panY,
        ease: 'Linear',
        duration: 500,
        onComplete: this.pan
      });
    }.bind(this);
    this.pan();


    this.bg.cameras.main.setSize(-1, -1);
    
    this.add.text(512, 100, 'ROT MAGUS', {
      fontFamily: 'font',
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '000000',
      strokeThickness: 8
    }).setOrigin(0.5);
    new TextButton({
      onPointerUp: function () {
        this.scene.start('GameScene');
        this.scene.start('GUIScene');
        this.scene.stop('InfiniteScene');
      }.bind(this),
      origin: 0.5,
      scene: this,
      text: 'Start game',
      x: 512,
      y: 200
    });
  }
}