/**
 * An interactive image that represents the target actor instead of an attribute of the target actor.
 *
 * @class SlotImage
 * @extends ActiveImage
 */
class Portrait extends ActiveImage {
  constructor(config) {
    super(config);
    this.targetScene.events.on('playerReady', function () {
      this.setFrame(this.targetScene[this.config.targetActor][this.targetAttribute]);
    }.bind(this));
    this.setFrame(this.targetActor[this.targetAttribute]);
  }
}