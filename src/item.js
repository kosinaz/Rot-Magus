class Item extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.config = this.scene.itemTypes[frame];
    this.scene.add.existing(this);
    this.hold = this.scene.time.addEvent({
      callback: function () {
        this.emit('hold');
      },
      callbackScope: this,
      delay: 50,
      loop: true,
      paused: true
    });
    this.on('hold', function () {
      this.x = this.scene.input.activePointer.x;
      this.y = this.scene.input.activePointer.y;
    });
    this.scene.input.on('pointerup', function () {
      this.alpha = 1;
    }, this);
  }
}