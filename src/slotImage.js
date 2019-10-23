
/**
 * An interactive image that represents a single slot of an inventory and serves as a drop zone for picked up item images. It targets either the inventory or one of the equipment attributes of the player.
 *
 * @class SlotImage
 * @extends {Phaser.GameObjects.Image}
 */
class SlotImage extends Phaser.GameObjects.Image {
  constructor(config) {
    super(
      game.scene.getScene(config.scene), 
      config.x, 
      config.y, 
      config.texture, 
      config.frame
    );
    this.targetScene = config.targetScene;
    this.targetActor = config.targetActor;
    this.targetAttribute = config.targetAttribute;

    // Set the slot interactive to let it listen to pointer events. 
    this.setInteractive();

    // If the pointer is over the slot and the button is pressed down.
    this.on('pointerdown', function () {

      // If there is an item on this slot.
      if (this.itemImage) {

        // Set the image of the item darker to show that the button of the pointer over it is pressed down. This will be reverted in the pointer up event of scene, because that event can also happen when the pointer is not over this slot and the item image colors still need to be reverted.
        this.itemImage.tint = 0xcccccc;

        // Save the updated item to let the scene know which item needs to be reverted in the pointer up event. 
        this.scene.pointerdownTargetItem = this.itemImage;
      }

      // Save this slot to let the scene know where the pointer up event needs to be happen to qualify as a click event. 
      this.scene.pointerdownTargetSlot = this;
    });

    // If the pointer is over the slot and the button is released.
    this.on('pointerup', function () {

      // If this is the same slot where the button of the pointer got pressed down. 
      if (this.scene.pointerdownTargetSlot === this) {

        // Emit the click event.
        this.emit('click');
      }
    });

    // If the pointer is over the slot and the button is clicked. A pointer event qualifies as a click if the pointerdown and pointerup event happened over the same slot even if it wasn't over it the whole time.
    this.on('click', function () {

      console.log(this.targetScene);
      console.log(this.targetActor);
      console.log(this.targetAttribute);
      if (this.scene.heldItem) {
        // if (!this.equips(this.scene.heldItem.config.equips)) {
        //   return;
        // }
        // if (this.scene.heldItem.config.equips === 'hands'
        //   && ((this.scene.gui.rightHand === this 
        //   && this.scene.gui.leftHand.item)
        //   || (this.scene.gui.leftHand === this 
        //   && this.scene.gui.rightHand.item))) {
        //   return;
        // }
        // if (this.scene.heldItem.config.equips === 'hand' 
        //   && ((this.scene.gui.rightHand === this 
        //   && this.scene.gui.leftHand.item
        //   && this.scene.gui.leftHand.item.config.equips === 'hands') 
        //   || (this.scene.gui.leftHand === this 
        //   && this.scene.gui.rightHand.item
        //   && this.scene.gui.rightHand.item.config.equips === 'hands'))) {
        //   return;
        // }
        this.scene.hold.paused = true;
        //this.scene.heldItem.x = this.x;
        //this.scene.heldItem.y = this.y;
        //this.itemImage = this.scene.heldItem;
        //this.scene.heldItem.setInteractive();
        //this.scene.heldItem.slot = this;
        if (this.type === 'Inventory') {
          this.scene.gameScene.player.inventory[this.i] =
            this.scene.heldItem.frame.name;
        } else if (this.type === 'Ground') {
          let x = this.scene.gameScene.player.tileX;
          let y = this.scene.gameScene.player.tileY;
          if (!this.scene.gameScene.map[x + ',' + y].itemList) {
            this.scene.gameScene.map[x + ',' + y].itemList = [];
          }
          this.scene.gameScene.map[x + ',' + y].itemList[this.i] =
            this.scene.heldItem.frame.name;
        } else {
          this.scene.gameScene.player.equipped[this.frame.name] =
            this.scene.heldItem.frame.name;
        }
        let nextItem = this.item;
        this.item = this.scene.heldItem;
        if (nextItem) {
          this.scene.children.bringToTop(nextItem);
          nextItem.hold.paused = false;
          this.scene.heldItem = nextItem;
        } else {
          this.scene.heldItem = null;
        }
        this.scene.heldItem.destroy();
      } else if (this.itemImage) {
        this.scene.gui.selected.setFrame(this.itemImage.frame.name);
        this.scene.children.bringToTop(this.itemImage);
        this.scene.heldItem = this.itemImage;
        this.scene.hold.paused = false;
        this.itemImage = null;
        if (this.scene.gui.inventorySlots.type === 'Inventory') {
          this.scene.gameScene.player.inventory[this.i] = null;
        } else if (this.type === 'Ground') {
          let x = this.scene.gameScene.player.tileX;
          let y = this.scene.gameScene.player.tileY;
          this.scene.gameScene.map[x + ',' + y][this.i] = null;
        } else {
          this.scene.gameScene.player.equipped[this.frame.name] = null;
        }
      }
      this.scene.gameScene.player.load = 0;
      let equipment = Object.keys(this.scene.gameScene.player.equipped);
      equipment.forEach(function (equips) {
        let item = this.scene.gameScene.player.equipped[equips];
        if (item) {
          let weight = this.scene.gameScene.itemTypes[item].weight;
          if (weight) {
            this.scene.gameScene.player.load += weight;
          }
        }
      }.bind(this));
      this.scene.gameScene.player.inventory.forEach(function (item) {
        if (item) {
          let weight = this.scene.gameScene.itemTypes[item].weight;
          if (weight) {
            this.scene.gameScene.player.load += weight;
          }
        }
      }.bind(this));
      // console.log('inventory', this.scene.gameScene.player.inventory);
      // console.log('equipment', this.scene.gameScene.player.equipped);
      // console.log('ground', this.scene.ground);
      // console.log('load', this.scene.gameScene.player.load);
      this.scene.gameScene.events.emit('updateAttribute', this);
    });
    this.scene.add.existing(this);
  }
  equips(item) {
    if (this.frame.name === 'slot') {
      return true;
    }
    if (item === this.frame.name) {
      return true;
    }
    return (this.frame.name === 'leftHand' || this.frame.name === 'rightHand')
      && (item === 'hand' || item === 'hands');
  }
}