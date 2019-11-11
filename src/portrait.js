/**
 * An interactive image that represents the target actor instead of an attribute of the target actor.
 *
 * @class SlotImage
 * @extends ActiveImage
 */
class Portrait extends ActiveImage {
  constructor(config) {
    super(config);
    if (this.config.i === undefined) {
      this.targetScene.events.on('playerReady', function () {
        this.setFrame(this.targetScene[this.config.targetActor][this.targetAttribute]);
      }.bind(this));
      this.setFrame(this.targetActor[this.targetAttribute]);
    } else {
      this.targetScene.events.on('playerReady', function () {
        if (this.targetActor[this.targetAttribute][this.config.i]) {
          this.setFrame(this.targetActor[this.targetAttribute][this.config.i].tileName);
          this.visible = true;
        } else {
          this.visible = false;
        }
      }.bind(this));
      if (this.targetActor[this.targetAttribute][this.config.i]) {
        this.setFrame(this.targetActor[this.targetAttribute][this.config.i].tileName);
      } else {
        this.visible = false;
      }
    }
  }
}