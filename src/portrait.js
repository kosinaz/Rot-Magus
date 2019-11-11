/**
 * An interactive image that represents the target actor instead of an attribute of the target actor.
 *
 * @class Portrait
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
      this.marker = this.scene.add.graphics();
      this.marker.lineStyle(1, 0xffff00, 1);
      this.marker.strokeRect(this.x - 11.5, this.y - 9.5, 23, 20);
      this.marker.depth = 5;
      this.marker.visible = false;
      this.on('click', function () {
        this.targetScene.player = this.targetActor[this.targetAttribute][this.config.i];
        this.targetScene.cameras.main.startFollow(this.targetScene.player, true, 1, 1, 0, 0);
        this.targetScene.events.emit('playerReady');
        this.targetScene.events.emit('attributesUpdated');
      }, this);
      this.targetScene.events.on('playerReady', function () {
        if (this.targetActor[this.targetAttribute][this.config.i]) {
          this.setFrame(this.targetActor[this.targetAttribute][this.config.i].tileName);
          this.visible = true;
          this.marker.visible = this.targetScene.player === this.targetActor[this.targetAttribute][this.config.i];
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