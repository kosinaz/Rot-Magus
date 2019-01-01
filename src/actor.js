let Actor = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
    function Actor(scene, x, y, texture, frame, isPlayer) {
      Phaser.GameObjects.Image.call(this, scene, x, y, texture, frame);
      this.isPlayer = isPlayer;
      this.target = {
        x: this.getX(),
        y: this.getY()
      }
      this.speed = 4;
      this.health = 120;
      scene.add.existing(this);
      scheduler.add(this, true);
    },
  act: function () {
    if (this.isPlayer) {
      engineLocked = true;
      engine.lock();
    } else {
      this.scanFOV();
      this.moveTo(this.target);
    }
  },
  getX: function () {
    return groundLayer.worldToTileX(this.x);
  },
  getY: function () {
    return groundLayer.worldToTileY(this.y);
  },
  isAtXY: function (x, y) {
    return this.getX() === x && this.getY() === y;
  },
  isAtWorldXY: function (x, y) {
    return this.isAtXY(groundLayer.worldToTileX(x), groundLayer.worldToTileY(y));
  },
  scanFOV: function () {
    this.newTarget = null;
    fov.compute(this.getX(), this.getY(), 13, function (x, y) {
      if (!this.newTarget && player.isAtXY(x, y)) {
        this.newTarget = {
          x: x,
          y: y
        };
      }
    }.bind(this));
    if (this.newTarget) {
      this.target = this.newTarget;
    }
  },
  moveTo: function (target) {
    if (target.x === undefined) {
      return false;
    }
    this.computePath(target.x, target.y);
    if (this.path.length < 2) {
      return false;
    }
    scheduler.setDuration(1.0 / this.speed);
    var x = this.path[1][0];
    var y = this.path[1][1];
    var actor = getActorAt(x, y);
    if (actor) {
      this.damage(actor);
    } else {
      this.x = groundLayer.tileToWorldX(x);
      this.y = groundLayer.tileToWorldY(y);
    }
  },
  damage: function (actor) {
    actor.health -= Math.floor(Math.random() * 6) + 1;
    this.effect = this.scene.add.sprite(actor.x + 12, actor.y + 11, 'tiles', 200);
    this.scene.time.delayedCall(250, function () {
      this.effect.destroy();
    }.bind(this), [], this);
  },
  computePath: function (x, y) {
    var a = new ROT.Path.AStar(x, y, function (x, y) {
      var actor = getActorAt(x, y);
      if (isPassableAtXY(x, y)) {
        if (actor) {
          if (actor === this) {
            return true;
          }
          return false;
        }
        return true;
      }
      return false;
    }.bind(this));
    this.path = [];
    a.compute(this.getX(), this.getY(), function (x, y) {
      this.path.push([x, y]);
    }.bind(this));
  }
});