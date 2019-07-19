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
      console.log('moved');
      this.gui.inventory.forEach(function () {

      })
      console.log(this.ground);
      let topItem = this.ground.filter(slot => slot !== null)[0];
      console.log(topItem);
      if (topItem) {
        this.gameScene.map.addItem(
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
      console.log('itemList', x, y, this.gameScene.map.tiles[x + ',' + y].itemList);
      this.ground = this.gameScene.map.tiles[x + ',' + y].itemList || [];
      console.log('ground', x, y, this.ground);
      if (this.ground.length) {
        console.log('ground', x, y, this.ground);
        this.ground.forEach(function (tileName, i) {
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

    /**
     * Create inventory
     */
    this.itemTypes = this.cache.json.get('itemTypes');
    this.gameScene.player.inventory.forEach(function (tileName, i) {
      this.gui.inventory[i].item = new Item(
        this, 
        this.gui.inventory[i].x, 
        this.gui.inventory[i].y, 
        'tiles', 
        tileName
      );
    }.bind(this));
  };
};