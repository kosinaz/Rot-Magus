/**
 * An interactive image that represents the target actor instead of an attribute of the target actor.
 *
 * @class SlotImage
 * @extends ActiveImage
 */
class Portrait extends ActiveImage {
  constructor(config) {
    super(config);
    this.setFrame(this.targetScene[this.targetActor][this.targetAttribute]);
  }
}