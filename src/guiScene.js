class GUIScene extends Phaser.Scene {
  constructor() {
    super('GUIScene');
  }
  
  create = function () {

    let guiElements = this.cache.json.get('guiElements');
    this.gui = {};
    GUIBuilder.init(guiElements.default);
    for (let i in guiElements) {
      if (guiElements.hasOwnProperty(i)) {
        this.gui[i] = GUIBuilder.create(guiElements[i]);
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
      if (!this.ground) {
        return;
      }
      let topItem = this.ground.filter(slot => slot !== null)[0];
      if (topItem) {
        this.gameScene.map.putItem(
          this.gameScene.player.tileX, 
          this.gameScene.player.tileY,
          topItem,
          this.ground
        );
      } else {
        this.gameScene.map.removeItem(
          this.gameScene.player.tileX,
          this.gameScene.player.tileY
        );
      };
      this.gui.ground.forEach(function (slot) {
        if (!slot.item) {
          return;
        }
        slot.item.destroy();
        slot.item = null;
      });
    }, this);

    this.gameScene.events.on('playerMoved', function () {
      let x = this.gameScene.player.tileX;
      let y = this.gameScene.player.tileY;
      this.ground = this.gameScene.map.tiles[x + ',' + y].itemList || [];
      if (this.ground.length) {
        this.ground.forEach(function (tileName, i) {
          if (tileName === null) {
            return;
          } 
          this.gui.ground[i].item = new Item(
            this,
            this.gui.ground[i].x,
            this.gui.ground[i].y,
            'tiles',
            tileName
          );
        }.bind(this));
      }
    }, this);

    this.gameScene.events.on('playerThrew', function () {
      if (this.gameScene.player.equipped.leftHand === null) {
        this.gui.leftHand.item.destroy();
      }
      if (this.gameScene.player.equipped.rightHand === null) {
        this.gui.rightHand.item.destroy();
      }
      this.gameScene.player.load = 0;
      let equipment = Object.keys(this.gameScene.player.equipped);
      equipment.forEach(function (equips) {
        let item = this.gameScene.player.equipped[equips];
        if (item) {
          let weight = this.gameScene.itemTypes[item].weight;
          if (weight) {
            this.gameScene.player.load += weight;
          }
        }
      }.bind(this));
      this.gameScene.player.inventory.forEach(function (item) {
        if (item) {
          let weight = this.gameScene.itemTypes[item].weight;
          if (weight) {
            this.gameScene.player.load += weight;
          }
        }
      }.bind(this));
      console.log('inventory', this.gameScene.player.inventory);
      console.log('equipment', this.gameScene.player.equipped);
      console.log('ground', this.scene.ground);
      console.log('load', this.gameScene.player.load);
      this.gameScene.events.emit('updateAttribute', this);
    }, this);

    /**
     * Create inventory
     */
    this.itemTypes = this.cache.json.get('itemTypes');
    this.gameScene.player.inventory.forEach(function (tileName, i) {
      let item = new Item(
        this, 
        this.gui.inventory[i].x, 
        this.gui.inventory[i].y, 
        'tiles', 
        tileName
      );
      item.slot = this.gui.inventory[i];
    }.bind(this));
  };
};