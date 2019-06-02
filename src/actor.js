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
      this.tileX = x;
      this.tileY = y;
      this.target = {
        x: this.tileX,
        y: this.tileY
      }
      this.path = null;      
      this.speed = 6;
      this.health = 120;
      this.maxHealth = 120;
      this.fov = scene.fov;
      this.noise = scene.noise;
      this.scene = scene;
      scene.add.existing(this);
      scheduler.add(this, true);
      this.setOrigin(0);
      this.visible = false;
      if (isPlayer) {
        this.visible = true;
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
      this.scene.time.delayedCall(1000 / game.speed, function () {
        if (this.target.x === this.tileX && this.target.y === this.tileY) { 
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
        if (this.target.x === this.tileX && this.target.y === this.tileY) {
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
    this.layer.forEachTile(tile => tile.visible = false);
    this.scene.itemLayer.forEachTile(tile => tile.visible = false);
    enemies.forEach(enemy => enemy.visible = false);

    // find the currently visible tiles
    this.fov.compute(this.tileX, this.tileY, 13, function (x, y) {
      
      // show the visible tiles
      let tile = this.layer.getTileAt(x, y);
      if (tile) {
        tile.visible = true;
      }
      tile = this.scene.itemLayer.getTileAt(x, y);
      if (tile) {
        tile.visible = true;
      }
      enemies.forEach(function (enemy) {
        if (enemy.tileX == x && enemy.tileY == y) {
          enemy.visible = true;
        }
      });

    }.bind(this));
  },
  scanFOV: function () {

    // find the currently visible tiles
    this.fov.compute(this.tileX, this.tileY, 13, function (x, y) {
      
      if (player.tileX === x && player.tileY === y) {
        this.target = {
          x: x,
          y: y
        };
        this.path = null;
       }
    }.bind(this));
  },

  move: function () {
    scheduler.setDuration(1.0 / this.speed);
    if (!this.path) {
      this.addPath(this.target.x, this.target.y);
    }
    if (this.path.length < 2) {    
      this.path = null;
      engine.unlock();
      return;
    }
    isAcceptingOrders = false;
    this.path.shift();
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 450 / game.speed,
      ease: 'Quad.easeOut',
      yoyo: true
    });
    let actor = this.getActorAt(this.path[0].x, this.path[0].y);
    if (actor) {
      if (this.isPlayer) {
        this.scene.tweens.add({
          targets: this,
          x: this.layer.tileToWorldX(this.path[0].x),
          y: this.layer.tileToWorldY(this.path[0].y),
          ease: 'Quad.easeInOut',
          duration: 450 / game.speed,
          yoyo: true
        });
        this.damage(actor);
        this.target = {
          x: this.tileX,
          y: this.tileY
        };
      } else if (actor.isPlayer) {        
        this.scene.tweens.add({
          targets: this,
          x: this.layer.tileToWorldX(this.path[0].x),
          y: this.layer.tileToWorldY(this.path[0].y),
          ease: 'Quad.easeInOut',
          duration: 450 / game.speed,
          yoyo: true
        });
        this.damage(actor);
      }
    } else {
      this.tileX = this.path[0].x;
      this.tileY = this.path[0].y;
      this.scene.events.emit('playerMoved');
      this.scene.tweens.add({
        targets: this,
        x: this.layer.tileToWorldX(this.tileX),
        y: this.layer.tileToWorldY(this.tileY),
        ease: 'Quad.easeInOut',
        duration: 900 / game.speed
      });
    }
    engine.unlock();
  },
  damage: function (actor) {
    let damage = ROT.RNG.getUniformInt(1, 10)
    actor.health -= damage;
    if (actor === player) {
      this.scene.events.emit('playerDamaged');
    }
    this.scene.time.delayedCall(450 / game.speed, function () {
      let effect = this.scene.add.sprite(
        this.layer.tileToWorldX(actor.tileX) + 12, 
        this.layer.tileToWorldY(actor.tileY) + 11, 
        'tilesetImage', 
        damage === 10 ? 201 : 200
      );
      this.scene.tweens.add({
        targets: effect,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 900 / game.speed,
        delay: 450 / game.speed,
        onComplete: function () {
          effect.destroy();
        }
      });
    }.bind(this));
    console.log(actor.name, actor.health);
    if (actor.health < 1) {
      actor.die();
    }
  },
  die: function () {
    if (this === player) {
      scheduler.clear();
      this.scene.events.emit('playerDied');
    } else {
      let effect = this.scene.add.sprite(
        this.x + 12,
        this.y + 11,
        'tilesetImage',
        this.frame.name
      );
      this.scene.time.delayedCall(450 / game.speed, function () {
        effect.destroy();
      });
      console.log(this.name, 'died');
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
    a.compute(this.tileX, this.tileY, function (x, y) {
      this.path.push({
        x: x,
        y: y
      });
    }.bind(this));
  },
  isAtXY: function (x, y) {
    return this.tileX === x && this.tileY === y;
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