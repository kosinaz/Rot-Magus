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

    // If the pointer is over the slot and the button is clicked. A pointer event qualifies as a click if the pointerdown and pointerup event happened over the same slot even if it wasn't over it the whole time.
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

        // If there is already an item on this slot.
        if (this.itemImage) {

          // Swap the held item images.
          this.scene.heldItem.setFrame(this.getItem().frame);

          // Swap the item config data.
          this.scene.heldItem.data = this.getItem();
          
        // If the slot is empty.
        } else {

          // Remove the config data about the held item.
          this.scene.heldItem.data = null;

          // Remove the image of the held item.
          this.scene.heldItem.destroy();

          // Remove the reference of the held item.
          this.scene.heldItem = undefined;
        }

        // Place the item on this slot.
        this.targetActor.setItem(item, this.targetActor[this.targetAttribute], this.i);

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
        this.targetActor.setItem(undefined, this.targetActor[this.targetAttribute], this.i);
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
  showTooltip() {
    let item = this.getItem();
    let notes = '';
    if (item) {
      this.tooltip = item.name;
      for (let attribute in item) {
        if (item.hasOwnProperty(attribute) &&
          attribute !== 'name' &&
          attribute !== 'frame' &&
          attribute !== 'effect') {
          if (attribute === 'damageRanged') {
            this.tooltip += '\n  ranged damage: +' + item[attribute];
          } else if (attribute === 'manaCost') {
            this.tooltip += '\n  mana cost: ' + item[attribute];
          } else if (attribute === 'damageMod') {
            this.tooltip += '\n  damage: ' +
              (item[attribute] > 0 ? '+' : '') + item[attribute];
          } else if (attribute === 'health') {
            this.tooltip += '\n  health: ' +
              (item[attribute] > 0 ? '+' : '') + item[attribute];
          } else if (attribute === 'walksOn') {
            this.tooltip += '\n  walk on: ' + item[attribute];
          } else if (attribute === 'healthRegen') {
            this.tooltip += '\n  health regeneration: ' + item[attribute];
          } else if (attribute === 'manaRegen') {
            this.tooltip += '\n  mana regeneration: ' + item[attribute];
          } else if (attribute === 'healthMax') {
            this.tooltip += '\n  maximum health: +' + item[attribute];
          } else if (attribute === 'manaMax') {
            this.tooltip += '\n  maximum mana: +' + item[attribute];
          } else if (attribute === 'speedBase') {
            this.tooltip += '\n  speed: +' + item[attribute];
          } else if (attribute === 'speedFix') {
            this.tooltip += '\n  fix speed: ' + item[attribute];
          } else if (attribute === 'speedMod') {
            this.tooltip += '\n  speed: ' + 
            (item[attribute] > 0 ? '+' : '') + item[attribute];
          } else if (attribute === 'strengthBase') {
            this.tooltip += '\n  strength: +' + item[attribute];
          } else if (attribute === 'agilityBase') {
            this.tooltip += '\n  agility: ' + 
            (item[attribute] > 0 ? '+' : '') + item[attribute];
          } else if (attribute === 'wisdomBase') {
            this.tooltip += '\n  wisdom: ' + 
            (item[attribute] > 0 ? '+' : '') + item[attribute];
          } else if (
              attribute === 'damage' ||
              attribute === 'defense' || 
              attribute === 'agility' ||
              attribute === 'speed' || 
              attribute === 'strength' || 
              attribute === 'wisdom' ||
              attribute === 'xp'
            ) {
            this.tooltip += '\n  ' + attribute + ': +' + item[attribute];
          } else if (attribute === 'note') {
            notes += '\n  ' + item[attribute];
          } else if (item[attribute] !== true) {
            this.tooltip += '\n  ' + attribute + ': ' + item[attribute];
          } else {
            notes += {
              'arrow': '\n  Required for bows!',
              'consumable': '\n  Single use only!',
              'ranged': '\n  Ranged attack!',
              'returns': '\n  Returns after every shot!',
              'throwable': '\n  Throwable!',
              'usesArrow': '\n  Requires arrows!'
            }[attribute];
          }
        }
      }
      this.tooltip += notes;
      super.showTooltip();
    } else {
      this.tooltip = this.config.tooltip;
      if (this.tooltip) {
        super.showTooltip();
      }
    }
  }
  /**
   * Returns true if the item can be placed on this slot.
   * @param {*} item
   * @returns {boolean} True if the item is placable.
   * @memberof SlotImage
   */
  equips(item) {

    // If this is either an inventory or a ground slot.
    if (this.frame.name === 'slot') {

      // Return true.
      return true;
    }

    // Else if this is an equipment slot that matches the equips condition of the item.
    if (this.frame.name === item.equips) {

      // Return true.
      return true;
    }

    // Else return true if this is either a left or a right hand slot and the items is one-handed or two-handed. 
    return (this.frame.name === 'leftHand' || this.frame.name === 'rightHand')
      && (item.equips === 'hand' || item.equips === 'hands');
  }
  
  /**
   * Returns the item that is held by the attribute of the target actor linked to this slot.
   * @returns {string} The held item.
   * @memberof SlotImage
   */
  getItem() {

    // If there is no target attribute.
    if (this.targetActor[this.targetAttribute] === null 
      || this.targetActor[this.targetAttribute] === undefined) {

      // Return nothing.
      return undefined;
    }
      
    // If there is an item in this slot.
    if (this.targetActor[this.targetAttribute][this.i] !== undefined) {

      // Return the item held in the specified index of the target attribute.
      return this.targetActor[this.targetAttribute][this.i];   
    }
  }

  /**
   * Updates the view of this slot based on the current state of the target attribute.
   * @memberof SlotImage
   */
  draw() {

    // If there is an item on this slot.
    if (this.getItem() !== undefined) {

      // If an item has already been displayed on this slot before. 
      if (this.itemImage) {

        // Update the view of the item.
        this.itemImage.setFrame(this.getItem().frame);

      // Else if this item got placed on this slot recently.
      } else {

        // Display the image of the item.
        this.itemImage = this.scene.add.image(
          this.x, 
          this.y, 
          'tiles', 
          this.getItem().frame
        );
      }
    
    // Else if there is no item on this slot but it's image is still visible.
    } else if (this.itemImage !== undefined) {

      // Remove the image of the item.
      this.itemImage.destroy();

      // Remove the reference of the image.
      this.itemImage = undefined;
    }
  }
}