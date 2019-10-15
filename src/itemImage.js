/**
 * An interactive image of an item that will be displayed at a given slot of its parent inventory and can be picked up and placed only on slots of its parent or other inventories. Item images are designed to provide a WYSIWYG way for the player to manage his inventory by moving them to different inventory sections that represents equipments, inventory, and items on the ground. This way the player will be able to pick up, start to use or wear all the items that are currently accessible for him. Changing the position of these items on the screen will change the current state of the player in the background, and the way how they will affect him. 
 * 
 * The frame attribute of the item image extends the role of the image object's same attribute, because it will be used as a unique index to connect the item image with the special attributes of the item that it represents. Most importantly the equips attribute, that will determine where the item image can be placed by the player.
 *
 * @class ItemImage
 * @extends {Phaser.GameObjects.Image}
 */
class ItemImage extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, frame, slot) {
    super(scene, x, y, texture, frame);
    this.slot = slot;
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
      console.log(this.slot.i);
      if (this.scene.gui.inventorySlots.type === 'Inventory') {
        this.scene.gameScene.player.inventory[this.slot.i] = null;
      } else if (this.slot.type === 'Ground') {
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