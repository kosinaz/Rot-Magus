/**
 * An interactive image that represents the target actor instead of an attribute of the target actor.
 *
 * @class Portrait
 * @extends ActiveImage
 */
class Portrait extends ActiveImage {
  constructor(config) {
    super(config);
    this.i = this.config.i;
    this.emits = this.config.emits;
    this.targetScene.events.on(this.event, this.draw, this);
    if (this.i !== undefined) {   
      this.target = this.targetScene[this.targetAttribute][this.i];
      this.overlaySelected = this.scene.add.graphics();
      this.overlaySelected.lineStyle(1, 0xffff00, 1);
      this.overlaySelected.strokeRect(this.x - 11.5, this.y - 9.5, 23, 20);
      this.overlaySelected.depth = 5;
      this.overlaySelected.visible = false;
      this.overlayWaiting = this.scene.add.image(this.x + 7, this.y - 6, 'gui', 'question');
      this.overlayWaiting.depth = 5;
      this.overlayWaiting.visible = false;
      this.on('pointerdown', function () {
        this.tint = 0xcccccc;
      }, this);
      this.scene.input.on('pointerup', function () {
        this.clearTint();
      }, this);
      this.on('click', function () {
        this.targetScene.events.emit(this.emits, this.i);
      }, this);
    }
    this.draw();
  }
  draw() {
    if (this.i === undefined) {
      this.setFrame(this.targetScene[this.targetAttribute].tileName);
      return;
    } 
    if (this.target) {
      this.visible = true;
      this.overlayWaiting.visible = this.target.isWaitingForOrder;
      this.overlaySelected.visible = this.target.isSelected;
      this.setFrame(this.target.tileName);
    } else {
      this.visible = false;
    }
  }
}