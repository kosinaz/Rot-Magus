let Actor = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
    function Actor(scene, x, y, texture, frame) {
      Phaser.GameObjects.Image.call(this, scene, x, y, texture, frame);
      scene.add.existing(this);
    },
  act: function () {
    
  },
  isAtXY: function (x, y) {
    return groundLayer.worldToTileX(this.x) === x 
      && groundLayer.worldToTileY(this.y) === y;
  }
});