class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }
  create() {
    this.add.existing(new TextButton({
      onPointerUp: function () {
        this.scene.start('GameScene');
        this.scene.start('GUIScene');
      }.bind(this),
      origin: 0,
      scene: this,
      text: 'New game',
      x: 100,
      y: 100
    }));
    this.add.existing(new TextButton({
      onPointerUp: function () {
        this.scene.start('InfiniteScene');
      }.bind(this),
      origin: 0,
      scene: this,
      text: 'Infinite mode',
      x: 100,
      y: 200
    }));
  }
}