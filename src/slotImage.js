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

        // Get the attributes of the picked up item.
        let item = this.scene.heldItem.data;
    
        // If the item cannot be equipped on this slot.
        if (!this.equips(item)) {

          // Don't let the player place the item on this slot.
          return;
        }

        // If the picked up item is two-handed, this slot is either of the hands and there is already a one-handed item in the other hand.
        if (item.equips === 'hands'
          && ((this.frame.name === 'rightHand' 
          && this.targetActor.equipped.leftHand !== undefined)
          || (this.frame.name === 'leftHand'
          && this.targetActor.equipped.rightHand !== undefined))) {

          // Don't let the player place the item on this slot.
          return;
        }

        // If the picked up item is one-handed, this slot is either of the hands and there is already a two-handed item on the other hand.
        if (item.equips === 'hand' 
          && ((this.frame.name === 'rightHand'
          && this.targetActor.equipped.leftHand !== undefined
          && this.targetActor.equipped.leftHand.equips === 'hands')
          || (this.frame.name === 'leftHand'
          && this.targetActor.equipped.rightHand !== undefined
          && this.targetActor.equipped.rightHand.equips === 'hands'))) {

          // Don't let the player place the item on this slot.
          return;
        }

        // Place the item on this slot.
        this.targetActor.setItem(item, this.targetAttribute, this.i);
        this.scene.heldItem.data = null;
        this.scene.heldItem.destroy();
        this.scene.heldItem = undefined;

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

      // If there is an item on this slot.
      } else if (this.itemImage) {

        // Create the copy as the item to serve as an indicator of it being picked up.
        this.scene.heldItem = this.scene.add.image(
          this.x,
          this.y,
          'tiles',
          this.getItem().frame
        );

        // Add the item config data to the image.
        this.scene.heldItem.data = this.getItem();

        // Remove the original item from the slot.
        this.targetActor.setItem(undefined, this.targetAttribute, this.i);
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
    if (this.frame.name === item.equips) {
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
  getItem() {

    // If there is no target attribute.
    if (this.targetAttribute === null || this.targetAttribute === undefined) {

      // Return nothing.
      return undefined;
    }

    // Else if this slot is part of a slot grid system.
    if (this.i !== undefined) {

      // If there is an item in this slot.
      if (this.targetAttribute[this.i] !== undefined) {

        // Return the name of the item held in the specified index of the target attribute.
        return this.targetAttribute[this.i];
      }

      // Else return nothing.
      return undefined;      
    }

    // Else return the name of the item held in the target attribute.
    return this.targetAttribute;
  }
  draw() {
    if (this.getItem() !== undefined) {
      if (this.itemImage) {
        console.log('already there');
      } else {
        this.itemImage = this.scene.add.image(
          this.x, 
          this.y, 
          'tiles', 
          this.getItem().frame
        );
      }
    } else if (this.itemImage !== undefined) {
      this.itemImage.destroy();
      this.itemImage = undefined;
    }
  }
}