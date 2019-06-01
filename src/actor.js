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
      this.noise = scene.noise;
      scene.add.existing(this);
      scheduler.add(this, true);
      this.setOrigin(0);
      if (isPlayer) {
        this.scene.cameras.main.startFollow(this, true, 1, 1, -12, -10);
      }
    },
  act: function () {
    // the engine needs to be locked, even if the player has a target and does
    // not need additional orders, because every action takes time, and no one
    // should move in the meantime
    if (this.isPlayer) {
      engine.lock();
      isAcceptingOrders = false;
      this.scene.time.delayedCall(150, function () {
        if (this.target.x === this.getX() && this.target.y === this.getY()) { 
          this.showFOV();   
          player = this;
          this.path = null;
          isAcceptingOrders = true;
        } else {
          this.move();
          this.showFOV();   
        }
      }.bind(this));
    } else {
      this.scanFOV();
      engine.lock();
        if (this.target.x === this.getX() && this.target.y === this.getY()) {
          this.path = null;
          engine.unlock();
        } else {
          this.move();
        }
    }
  },
  orderTo: function (x, y) {
    if (!isAcceptingOrders) {
      return;
    }
    let tile = this.layer.getTileAt(x, y);
    if (tile && (tile.index !== 17 && tile.index !== 21)) {
      this.target = {
        x: x,
        y: y
      };
      this.move();
    }
  },
  showFOV: function () {
    
    // hide all tiles
    this.layer.forEachTile(function (tile) {
      tile.visible = false;
    });

    // find the currently visible tiles
    this.fov.compute(this.getX(), this.getY(), 13, function (x, y) {
      
      // show the visible tiles
      let tile = this.layer.getTileAt(x, y);
      if (tile) {
        tile.visible = true;
      }
    }.bind(this));
  },
  scanFOV: function () {

    // find the currently visible tiles
    this.fov.compute(this.getX(), this.getY(), 13, function (x, y) {
      
      if (player.getX() === x && player.getY() === y) {
        this.target = {
          x: x,
          y: y
        };
        this.path = null;
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
    console.log('before shift:', this.name, this.path.length);
    if (this.path.length < 2) {    
      this.path = null;
      engine.unlock();
      return;
    }
    isAcceptingOrders = false;
    scheduler.setDuration(1.0 / this.speed);
    this.path.shift();
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 50,
      ease: 'Quad.easeOut',
      yoyo: true
    });
    this.scene.tweens.add({
      targets: this,
      x: this.layer.tileToWorldX(this.path[0].x),
      y: this.layer.tileToWorldY(this.path[0].y),
      ease: 'Quad.easeInOut',
      duration: 100
    });
    engine.unlock();
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
      let tile = this.layer.getTileAt(x, y);
      return tile && (tile.index !== 17 && tile.index !== 21);
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