class Slot extends Phaser.GameObjects.Image {
  constructor(config) {
    super(
      game.scene.getScene(config.scene), 
      config.x, 
      config.y, 
      config.texture, 
      config.frame
    );
    this.setInteractive();
    this.on('pointerdown', function () {
      if (this.item) {
        this.item.alpha = 0.5;
      }
      this.scene.pointerdownTarget = this;
    });
    this.on('pointerup', function () {
      if (this.scene.pointerdownTarget === this) {
        this.emit('click');
      }
      this.scene.pointerdownTarget = null;
    });
    this.on('click', function () {
      if (this.scene.heldItem) {
        this.scene.heldItem.hold.paused = true;
        this.scene.heldItem.x = this.x;
        this.scene.heldItem.y = this.y;
        let nextItem = this.item;
        this.item = this.scene.heldItem;
        if (nextItem) {
          this.scene.children.bringToTop(nextItem);
          nextItem.hold.paused = false;
          this.scene.heldItem = nextItem;
        } else {
          this.scene.heldItem = null;
        }
      } else if (this.item) {
        this.scene.children.bringToTop(this.item);
        this.item.hold.paused = false;
        this.scene.heldItem = this.item;
        this.item = null;
      }
    });
    this.scene.add.existing(this);
  }
}