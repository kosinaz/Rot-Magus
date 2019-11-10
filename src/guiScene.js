class GUIScene extends Phaser.Scene {
  constructor() {
    super('GUIScene');
  }
   
  create() {
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

    new TextButton({
      onPointerUp: function () {
        game.scene.getScene('GameScene').events.emit('gameTerminated', this);
      }.bind(this),
      origin: 0,
      scene: this,
      size: '16px',
      strokeThickness: 3,
      text: 'Back to main menu',
      x: 5,
      y: 553
    });

    this.hold = this.time.addEvent({
      callback: function () {
        if (this.heldItem) {
          this.heldItem.x = this.input.activePointer.x;
          this.heldItem.y = this.input.activePointer.y;
        }
      },
      callbackScope: this,
      delay: 50,
      loop: true
    });

    this.input.on('pointerup', function () {
      if (this.pointerdownTargetItem) {
        this.pointerdownTargetItem.clearTint();
      }
    }, this);
  }
}