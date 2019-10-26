class GUIScene extends Phaser.Scene {
  constructor() {
    super('GUIScene');
  }
  
  create = function () {

    let guiElements = this.cache.json.get('guiElements');
    this.gui = {};
    this.classes = {
      TextLabel,
      TextLabelStroked,
      TextLabelStrokedBar,
      Portrait,
      SlotGrid,
      SlotImage,
      ActiveImage
    };
    for (let i in guiElements) {
      if (guiElements.hasOwnProperty(i)) {
        if (i !== 'default') {
          this.gui[i] = new this.classes[guiElements[i].type]({
            ...guiElements.default,
            ...guiElements[i]
          });
        }
      }
    }
    
    // Set the background black, the color of currently invisible areas.
    this.cameras.main.setBackgroundColor('#616161');
    
    /**
     * Grab a reference to the Game Scene
     */
    this.gameScene = this.scene.get('GameScene');
    
    /**
     * Listen for events from it
     */
    this.gameScene.events.on('playerStartedMoving', function () {
      // if (!this.ground) {
      //   return;
      // }
      // let topItem = this.ground.filter(slot => slot !== null)[0];
      // if (topItem) {
      //   this.gameScene.map.putItem(
      //     this.gameScene.player.tileX, 
      //     this.gameScene.player.tileY,
      //     topItem,
      //     this.ground
      //   );
      // } else {
      //   this.gameScene.map.removeItem(
      //     this.gameScene.player.tileX,
      //     this.gameScene.player.tileY
      //   );
      // };
      // this.gui.groundSlots.forEach(function (slot) {
      //   if (!slot.item) {
      //     return;
      //   }
      //   slot.item.destroy();
      //   slot.item = null;
      // });
    }, this);

    this.gameScene.events.on('playerMoved', function () {

      // // Grab the x coordinate of the player to use as the ID of the ground he is currently standing on.
      // let x = this.gameScene.player.tileX;

      // // Grab the y coordinate of the player to use as the ID of the ground he is currently standing on.
      // let y = this.gameScene.player.tileY;

      // // If the there are already items on the ground at the player's current position, set their list as the ground to be displayed on the UI.
      // this.ground = this.gameScene.map.tiles[x + ',' + y].itemList || [];

      // // If there is any item on the ground.
      // if (this.ground.length) {

        
      //   // Iterate through all the items on the ground.
      //   this.ground.forEach(function (tileName, i) {
          
      //     // Ignore the empty slots.
      //     if (tileName === null) {
      //       return;
      //     } 
          
      //     // Create an interactive image for each of the items on the corresponding slot image of the ground.
      //     this.gui.groundSlots[i].item = new ItemImage(
      //       this,
      //       this.gui.groundSlots[i].x,
      //       this.gui.groundSlots[i].y,
      //       'tiles',
      //       tileName
      //       );
      //   }.bind(this));
      // }
    }, this);

    this.gameScene.events.on('playerThrew', function () {
      // if (this.gameScene.player.equipped.leftHand === null) {
      //   this.gui.leftHand.item.destroy();
      // }
      // if (this.gameScene.player.equipped.rightHand === null) {
      //   this.gui.rightHand.item.destroy();
      // }
      // this.gameScene.player.load = 0;
      // let equipment = Object.keys(this.gameScene.player.equipped);
      // equipment.forEach(function (equips) {
      //   let item = this.gameScene.player.equipped[equips];
      //   if (item) {
      //     let weight = this.gameScene.itemTypes[item].weight;
      //     if (weight) {
      //       this.gameScene.player.load += weight;
      //     }
      //   }
      // }.bind(this));
      // this.gameScene.player.inventory.forEach(function (item) {
      //   if (item) {
      //     let weight = this.gameScene.itemTypes[item].weight;
      //     if (weight) {
      //       this.gameScene.player.load += weight;
      //     }
      //   }
      // }.bind(this));
      // console.log('inventory', this.gameScene.player.inventory);
      // console.log('equipment', this.gameScene.player.equipped);
      // console.log('ground', this.scene.ground);
      // console.log('load', this.gameScene.player.load);
      // this.gameScene.events.emit('updateAttribute', this);
    }, this);

    this.hold = this.time.addEvent({
      callback: function () {
        this.heldItem.x = this.input.activePointer.x;
        this.heldItem.y = this.input.activePointer.y;
      },
      callbackScope: this,
      delay: 50,
      loop: true,
      paused: true
    });

    this.input.on('pointerup', function () {
      if (this.pointerdownTargetItem) {
        this.pointerdownTargetItem.clearTint();
      }
    }, this);

    /**
     * Create inventory
     */
    this.itemTypes = this.cache.json.get('itemTypes');
    // this.gameScene.player.inventory.forEach(function (tileName, i) {
    //   this.gui.inventorySlots[i].itemImage = this.add.image(
    //     this.gui.inventorySlots[i].x, 
    //     this.gui.inventorySlots[i].y,
    //     'tiles', 
    //     tileName
    //   );
      // let item = new ItemImage(
      //   this, 
      //   this.gui.inventorySlots[i].x, 
      //   this.gui.inventorySlots[i].y,
      //   'tiles', 
      //   tileName
      // );
      // item.slot = this.gui.inventorySlots[i];
      //this.gameScene.selected = item;
    // }.bind(this));

  };
};