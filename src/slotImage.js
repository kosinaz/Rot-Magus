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

      // If the player already picked up an item to place to somewhere else.
      if (this.scene.heldItem) {

        // Get the config of the picked up item.
        let item = this.targetScene.itemTypes[this.scene.heldItem.frame.name];
    
      // If the item cannot be equipped on this slot.
      if (!this.equips(item)) {

        // Don't let the player place the item on this slot.
        return;
      }

      // If the picked up item is two-handed, this slot is either of the hands and there is already a one-handed item in the other hand.
      if (item.equips === 'hands'
        && ((this.frame.name === 'rightHand' 
        && this.targetActor.leftHand !== undefined)
        || (this.frame.name === 'leftHand'
        && this.targetActor.rightHand !== undefined))) {

        // Don't let the player place the item on this slot.
        return;
      }

      // If the picked up item is one-handed, this slot is either of the hands and there is already a two-handed item on the other hand.
      // if (item.equips === 'hand' 
      //   && ((this.frame.name === 'rightHand'
      //   && this.targetActor.leftHand !== undefined
      //   && this.scene.gui.leftHand.item.config.equips === 'hands') 
      //   || (this.frame.name === 'leftHand'
      //   && this.targetActor.rightHand !== undefined
      //   && this.scene.gui.rightHand.item.config.equips === 'hands'))) {
      //   return;
      // }
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
      } else if (this.itemImage) {
        this.scene.children.bringToTop(this.itemImage);
        this.scene.heldItem = this.scene.add.image(
          this.x,
          this.y,
          'tiles',
          this.getItemName()
        );
        this.targetActor.setItem(name, this.targetAttribute, this.i);
      }
    });
    this.scene.add.existing(this);
    this.targetScene.events.on('playerReady', function () {
      this.draw();
    }.bind(this));
    this.targetScene.events.on('attributesUpdated', function () {
      this.draw();
    }.bind(this));
    this.draw();
  }

  equips(item) {
    if (this.frame.name === 'slot') {
      return true;
    }
    return (this.frame.name === 'leftHand' || this.frame.name === 'rightHand')
      && (item.equips === 'hand' || item.equips === 'hands');
  }
  
  /**
   * Returns the name of the item that is held by the attribute of the target actor linked to this slot.
   * @returns {string} The name of the held item.
   * @memberof SlotImage
   */
  getItemName() {

    // If this slot is part of a slot grid system.
    if (this.targetAttribute && this.i !== undefined) {

      // Return the name of the item held in the specified index of the target attribute.
      return this.targetAttribute[this.i];
    }

    // Else return the name of the item held in the target attribute.
    return this.targetAttribute;
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