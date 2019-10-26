/**
 * An interactive image that represents a single slot of an inventory and serves as a drop zone for picked up item images. It targets either the inventory or one of the equipment attributes of the player.
 *
 * @class SlotImage
 * @extends ActiveImage
 */
class SlotImage extends ActiveImage {
  constructor(config) {
    super(config);
    this.i = config.i;

    // Extend the ActiveImage's on click event.
    this.on('click', function () {
    });
    //   if (this.scene.heldItem) {
    //     // if (!this.equips(this.scene.heldItem.config.equips)) {
    //     //   return;
    //     // }
    //     // if (this.scene.heldItem.config.equips === 'hands'
    //     //   && ((this.scene.gui.rightHand === this 
    //     //   && this.scene.gui.leftHand.item)
    //     //   || (this.scene.gui.leftHand === this 
    //     //   && this.scene.gui.rightHand.item))) {
    //     //   return;
    //     // }
    //     // if (this.scene.heldItem.config.equips === 'hand' 
    //     //   && ((this.scene.gui.rightHand === this 
    //     //   && this.scene.gui.leftHand.item
    //     //   && this.scene.gui.leftHand.item.config.equips === 'hands') 
    //     //   || (this.scene.gui.leftHand === this 
    //     //   && this.scene.gui.rightHand.item
    //     //   && this.scene.gui.rightHand.item.config.equips === 'hands'))) {
    //     //   return;
    //     // }
    //     this.scene.hold.paused = true;
    //     //this.scene.heldItem.x = this.x;
    //     //this.scene.heldItem.y = this.y;
    //     //this.itemImage = this.scene.heldItem;
    //     //this.scene.heldItem.setInteractive();
    //     //this.scene.heldItem.slot = this;
    //     if (this.type === 'Inventory') {
    //       this.scene.gameScene.player.inventory[this.i] =
    //         this.scene.heldItem.frame.name;
    //     } else if (this.type === 'Ground') {
    //       let x = this.scene.gameScene.player.tileX;
    //       let y = this.scene.gameScene.player.tileY;
    //       if (!this.scene.gameScene.map[x + ',' + y].itemList) {
    //         this.scene.gameScene.map[x + ',' + y].itemList = [];
    //       }
    //       this.scene.gameScene.map[x + ',' + y].itemList[this.i] =
    //         this.scene.heldItem.frame.name;
    //     } else {
    //       this.scene.gameScene.player.equipped[this.frame.name] =
    //         this.scene.heldItem.frame.name;
    //     }
    //     let nextItem = this.item;
    //     this.item = this.scene.heldItem;
    //     if (nextItem) {
    //       this.scene.children.bringToTop(nextItem);
    //       nextItem.hold.paused = false;
    //       this.scene.heldItem = nextItem;
    //     } else {
    //       this.scene.heldItem = null;
    //     }
    //     this.scene.heldItem.destroy();
    //   } else if (this.itemImage) {
    //     this.scene.gui.selected.setFrame(this.itemImage.frame.name);
    //     this.scene.children.bringToTop(this.itemImage);
    //     this.scene.heldItem = this.itemImage;
    //     this.scene.hold.paused = false;
    //     this.itemImage = null;
    //     if (this.scene.gui.inventorySlots.type === 'Inventory') {
    //       this.scene.gameScene.player.inventory[this.i] = null;
    //     } else if (this.type === 'Ground') {
    //       let x = this.scene.gameScene.player.tileX;
    //       let y = this.scene.gameScene.player.tileY;
    //       this.scene.gameScene.map[x + ',' + y][this.i] = null;
    //     } else {
    //       this.scene.gameScene.player.equipped[this.frame.name] = null;
    //     }
    //   }
    //   this.scene.gameScene.player.load = 0;
    //   let equipment = Object.keys(this.scene.gameScene.player.equipped);
    //   equipment.forEach(function (equips) {
    //     let item = this.scene.gameScene.player.equipped[equips];
    //     if (item) {
    //       let weight = this.scene.gameScene.itemTypes[item].weight;
    //       if (weight) {
    //         this.scene.gameScene.player.load += weight;
    //       }
    //     }
    //   }.bind(this));
    //   this.scene.gameScene.player.inventory.forEach(function (item) {
    //     if (item) {
    //       let weight = this.scene.gameScene.itemTypes[item].weight;
    //       if (weight) {
    //         this.scene.gameScene.player.load += weight;
    //       }
    //     }
    //   }.bind(this));
    //   // console.log('inventory', this.scene.gameScene.player.inventory);
    //   // console.log('equipment', this.scene.gameScene.player.equipped);
    //   // console.log('ground', this.scene.ground);
    //   // console.log('load', this.scene.gameScene.player.load);
    //   this.scene.gameScene.events.emit('updateAttribute', this);
    // });
    this.scene.add.existing(this);
    this.draw();
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
  
  /**
   * Returns the name of the item that is held by the attribute of the target actor linked to this slot.
   * @returns {string} The name of the held item.
   * @memberof SlotImage
   */
  getItemName() {

    // If this slot is part of a slot grid system.
    if (this.targetScene[this.targetActor][this.targetAttribute] 
      && this.i !== undefined) {

      // Return the name of the item held in the specified index of the target attribute.
      return this.targetScene[this.targetActor][this.targetAttribute][this.i];
    }

    // Else return the name of the item held in the target attribute.
    return this.targetScene[this.targetActor][this.targetAttribute];
  }
  draw() {
    if (this.getItemName()) {
      if (this.itemImage) {
        console.log('already there');
      } else {
        this.itemImage = this.scene.add.image(
          this.x, 
          this.y, 
          'tiles', 
          this.getItemName()
        );
      }
    } else if (this.itemImage !== undefined) {
      this.itemImage.destroy();
      this.itemImage = undefined;
    }
  }
}