class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  create() {
    this.bg = this.scene.get('InfiniteScene');

    this.log = this.add.text(100, 100, '');
      this.pan = function () {
        this.bg.map.hide();
        this.bg.draw();
        this.log.text = this.bg.map.tiles.length;
        this.tweens.add({
          targets: this.bg.cameras.main,
          x: '-= 24',
          y: '-= 21',
          ease: 'Linear',
          duration: 500,
          //completeDelay: 3000,
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