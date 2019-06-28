class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  create() {
    this.bg = this.scene.get('InfiniteScene');
    this.panX = ['+=24', '+=0', '-=24'][~~(Math.random() * 3)];
    this.panY = ['+=21', '+=0', '-=21'][~~(Math.random() * 3)];
    this.pan = function () {
      this.bg.map.hideOutOfBounds();
      this.bg.draw();
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