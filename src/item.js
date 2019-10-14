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
    this.setInteractive();
    this.on('hold', function () {
      this.x = this.scene.input.activePointer.x;
      this.y = this.scene.input.activePointer.y;
    });
    this.on('pointerdown', function () {
      this.tint = 0xcccccc;
      this.scene.pointerdownTarget = this;
    });
    this.on('pointerup', function () {
      if (this.scene.pointerdownTarget === this) {
        this.emit('click');
      }
      this.scene.pointerdownTarget = null;
    });
    this.scene.input.on('pointerup', function () {
      this.clearTint();
    }, this);
    this.on('click', function () {
      this.disableInteractive();
      console.log(this.scene.gui);
      this.scene.gui.selected.setFrame(this.frame.name);
      this.scene.children.bringToTop(this);
      this.hold.paused = false;
      this.scene.heldItem = this;
      if (this.slot.type === 'Inventory') {
        this.scene.gameScene.player.inventory[this.slot.i] = null;
      } else if (this.type === 'Ground') {
        let x = this.scene.gameScene.player.tileX;
        let y = this.scene.gameScene.player.tileY;
        this.scene.gameScene.map[x + ',' + y][this.slot.i] = null;
      } else {
        this.scene.gameScene.player.equipped[this.frame.name] = null;
      }
      this.slot = null;
    });
  }
}