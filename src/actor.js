let Actor = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
    function Actor(scene, x, y, texture, frame, layer, isPlayer) {
      Phaser.GameObjects.Image.call(
        this, 
        scene, 
        x * 24, 
        y * 21, 
        texture, 
        frame
      );
      this.layer = layer;
      this.isPlayer = isPlayer;
      this.target = {
        x: this.getX(),
        y: this.getY()
      }
      this.path = null;
      this.speed = 4;
      this.health = 120;
      this.maxHealth = 120;
      this.fov = scene.fov;
      scene.add.existing(this);
      scheduler.add(this, true);
      this.setOrigin(0);
    },
  act: function () {
    // the engine needs to be locked, even if the player has a target and does
    // not need additional orders, because every action takes time, and no one
    // should move in the meantime
    engine.lock();
    this.showFOV();
    this.scene.tweens.add({
      targets: this.scene.cameras.main,
      scrollX: this.x - 13 * 24,
      scrollY: this.y - 13 * 21,
      ease: 'Power1',
      duration: 100,
      onComplete: function () {
        this.scene.time.delayedCall(100, function () {
          if (this.target.x === this.getX() && this.target.y === this.getY()) { 
            player = this;
            this.path = null;
            isAcceptingOrders = true;
          } else {
            this.move();
          }
        }.bind(this));
      }.bind(this)
    });
  },
  orderTo: function (x, y) {
    if (!isAcceptingOrders) {
      return;
    }
    this.target = {
      x: x,
      y: y
    };
    this.move();
  },
  showFOV: function () {
    
    // overlay fog of war on every tile that was already visible
    this.layer.forEachTile(tile => (tile.alpha = tile.alpha ? 0.3 : 0));
    //itemLayer.forEachTile(tile => (tile.alpha = tile.alpha ? 0.3 : 0));
    enemies.forEach(function (enemy) {
      enemy.alpha = 0;
    });
    
    // find the visible tiles
    this.fov.compute(this.getX(), this.getY(), 13, function (x, y) {
      
      // show the visible tiles
      let tile = this.layer.getTileAt(x, y);
      if (tile) {
        tile.alpha = 1;
      }
    }.bind(this));
  },
  getX: function () {
    return this.layer.worldToTileX(this.x);
  },
  getY: function () {
    return this.layer.worldToTileY(this.y);
  },
  move: function () {
    if (!this.path) {
      this.addPath(this.target.x, this.target.y);
    }
    if (this.path.length < 1) {    
      this.path = null;
      return;
    }
    isAcceptingOrders = false;
    scheduler.setDuration(1.0 / this.speed);
    this.path.shift();
    this.scene.tweens.add({
      targets: this,
      x: this.layer.tileToWorldX(this.path[0].x),
      y: this.layer.tileToWorldY(this.path[0].y),
      ease: 'Power1',
      duration: 100,
      onComplete: function () {
        engine.unlock();
      }.bind(this)
    });
  },
  damage: function (actor) {
    actor.health -= Math.floor(Math.random() * 60) + 1;
    if (actor === player) {
      this.scene.events.emit('playerDamaged');
    }
    this.effect = this.scene.add.sprite(actor.x + 12, actor.y + 11, 'tiles', 200);
    this.scene.time.delayedCall(100, function () {
      this.effect.destroy();
    }.bind(this), [], this);
    if (actor.health < 1) {
      actor.die();
    }
  },
  die: function () {
    if (this === player) {
      scheduler.clear();
      this.scene.events.emit('playerDied');
    } else {
      enemies.splice(enemies.indexOf(this), 1);
      scheduler.remove(this);
      this.destroy();
    }
  },
  addPath: function (x, y) {
    let a = new ROT.Path.AStar(x, y, function (x, y) {
      return !this.layer.getTileAt(x, y).properties.unpassable
    }.bind(this));
    this.path = [];
    a.compute(this.getX(), this.getY(), function (x, y) {
      this.path.push({
        x: x,
        y: y
      });
    }.bind(this));
  },
  getActorAt: function (x, y) {
    if (player.isAtXY(x, y)) {
      return player;
    }
    for (var i = 0; i < enemies.length; i += 1) {
      if (enemies[i].isAtXY(x, y)) {
        return enemies[i];
      }
    }
  }
});