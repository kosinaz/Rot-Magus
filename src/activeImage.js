class ActiveImage extends Phaser.GameObjects.Image {
  constructor(config) {
    super(
      game.scene.getScene(config.scene),
      config.x,
      config.y,
      config.texture,
      config.frame
    );
    this.config = config;
    this.fill = config.fill;
    this.fontFamily = config.fontFamily;
    this.fontSize = config.fontSize;
    this.targetScene = game.scene.getScene(config.targetScene);
    this.targetActor = this.targetScene[config.targetActor];
    this.targetAttribute = config.targetAttribute;
    this.tooltip = config.tooltip;
    
    this.setOrigin(config.originX, config.originY);
    this.setInteractive();
    this.on('pointerover', this.showTooltip);
    this.on('pointerout', this.hideTooltip);

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
    this.scene.add.existing(this);
    this.update();
  }
  showTooltip() {
    if (this.tooltip) {
      this.tooltipWindow = new Tooltip({
        ...this.config,
        ...{
          tooltip: this.tooltip
        }
      });
    }
  }
  hideTooltip() {
    if (this.tooltipWindow) {
      this.tooltipWindow.destroy();
    }
  }
}