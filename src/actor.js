let Actor = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
    function Actor(scene, x, y, texture, layer, config) {
      Phaser.GameObjects.Image.call(
        this, 
        scene, 
        x * 24, 
        y * 21, 
        texture, 
        config.tileIndex
      );
      this.layer = layer;
      this.name = config.name;
      this.isPlayer = config.player;
      this.tileX = x;
      this.tileY = y;
      this.tileIndex = config.tileIndex;
      this.target = {
        x: this.tileX,
        y: this.tileY
      }
      this.path = null;      
      this.speed = config.speed;
      this.xp = 0;
      this.xpMax = 50;
      this.level = 0;
      this.health = config.health;
      this.healthMax = this.health;
      this.mana = config.mana;
      this.manaMax = this.mana;
      this.strength = config.strength;
      this.load = 14;
      this.agility = config.agility;
      this.wisdom = config.wisdom;
      this.walksOn = [];
      this.fov = scene.fov;
      this.noise = scene.noise;
      this.scene = scene;
      this.gui = this.scene.scene.get('GUIScene');
      scene.add.existing(this);
      scheduler.add(this, true);
      this.setOrigin(0);
      this.visible = false;
      if (this.isPlayer) {
        this.visible = true;
        this.scene.cameras.main.startFollow(this, true, 1, 1, -12, -10);
      }
    },
  act: function () {
    scheduler.setDuration(1.0 / this.speed);
    // the engine needs to be locked, even if the player has a target and does
    // not need additional orders, because every action takes time, and no one
    // should move in the meantime
    if (this.isPlayer) {
      engine.lock();
      isAcceptingOrders = false;
      this.scene.time.delayedCall(1000 / game.speed, function () {
        this.showFOV();   
        let targetActor = this.getActorAt(this.target.x, this.target.y);
        if (targetActor === this) {
          player = this;
          this.path = null;
          isAcceptingOrders = true;
        } else {
          this.move();
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
    let targetActor = this.getActorAt(x, y);
    if (targetActor &&
      this.gui.inventory &&
      this.gui.inventory.getTileAt(6, 3) &&
      this.gui.inventory.getTileAt(6, 3).index === 108) {
      this.target = {
        x: this.tileX,
        y: this.tileY
      }
      this.damage(targetActor);
    } else {
      let tile = this.layer.getTileAt(x, y);
      if (tile && (
        this.walksOn.includes(tile.index) 
        || tile.index !== 12 
        && tile.index !== 13 
        && tile.index !== 16 
        && tile.index !== 17 
        && tile.index !== 21
      )) {
        this.target = {
          x: x,
          y: y
        };
        this.move();
      }
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
      console.log(player.name + ' moved to ' + this.tileX + ', ' + this.tileY);
      this.scene.tweens.add({
        targets: this,
        x: this.layer.tileToWorldX(this.tileX),
        y: this.layer.tileToWorldY(this.tileY),
        ease: 'Quad.easeInOut',
        duration: 900 / game.speed
      });
      engine.unlock();
    }
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
    engine.unlock();
    this.scene.events.emit('updateAttribute', this);
  },
  earnXP: function (amount) {
    this.xp += amount;
    if (this.xp >= this.maxXP) {
      this.xp -= this.maxXP;
      this.maxXP *= 2;
      this.level += 1;
    }
    this.scene.events.emit('updateAttribute', this);
  },
  die: function () {
    if (this === player) {
      scheduler.clear();
      this.scene.events.emit('playerDied');
    } else {
      player.earnXP(10);
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
      return tile && (
        this.walksOn.includes(tile.index) ||
        tile.index !== 12 &&
        tile.index !== 13 &&
        tile.index !== 16 &&
        tile.index !== 17 &&
        tile.index !== 21
      )
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