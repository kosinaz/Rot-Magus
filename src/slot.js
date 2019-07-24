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

      // Will be reverted in the items pointer up event.
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
      if (this.scene.heldItem) {
        if (!this.equips(this.scene.heldItem.config.equips)) {
          return;
        }
        if (this.scene.heldItem.config.equips === 'hands'
          && ((this.scene.gui.rightHand === this 
          && this.scene.gui.leftHand.item)
          || (this.scene.gui.leftHand === this 
          && this.scene.gui.rightHand.item))) {
          return;
        }
        if (this.scene.heldItem.config.equips === 'hand' 
          && ((this.scene.gui.rightHand === this 
          && this.scene.gui.leftHand.item
          && this.scene.gui.leftHand.item.config.equips === 'hands') 
          || (this.scene.gui.leftHand === this 
          && this.scene.gui.rightHand.item
          && this.scene.gui.rightHand.item.config.equips === 'hands'))) {
          return;
        }
        this.scene.heldItem.hold.paused = true;
        this.scene.heldItem.x = this.x;
        this.scene.heldItem.y = this.y;
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
      } else if (this.item) {
        this.scene.children.bringToTop(this.item);
        this.item.hold.paused = false;
        this.scene.heldItem = this.item;
        this.item = null;
        if (this.type === 'Inventory') {
          this.scene.gameScene.player.inventory[this.i] = null;
        } else if (this.type === 'Ground') {
          this.scene.ground[this.i] = null;
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
      console.log('inventory', this.scene.gameScene.player.inventory);
      console.log('equipment', this.scene.gameScene.player.equipped);
      console.log('ground', this.scene.ground);
      console.log('load', this.scene.gameScene.player.load);
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