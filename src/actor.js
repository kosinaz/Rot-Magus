let Actor = new Phaser.Class({
  Extends: Phaser.GameObjects.Image,
  initialize:
    function Actor(scene, x, y, texture, map, config) {
      Phaser.GameObjects.Image.call(
        this, 
        scene, 
        x * 24 + 12, 
        y * 21 + 11, 
        texture, 
        config.tileIndex
      );
      this.map = map;
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
      this.walksOn = config.walksOn;
      this.fov = scene.fov;
      this.noise = scene.noise;
      this.scene = scene;
      this.gui = this.scene.scene.get('GUIScene');
      scene.add.existing(this);
      scheduler.add(this, true);
      this.visible = false;
      if (this.isPlayer) {
        this.visible = true;
        this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);
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
    if (x === this.tileX && y === this.tileY) {
      this.rest();
    }
    if (!isAcceptingOrders) {
      return;
    }
    let targetActor = this.getActorAt(x, y);
    if (targetActor &&
      this.gui.inventory &&
      this.gui.inventory.getTileAt(6, 3) &&
      this.gui.inventory.getTileAt(6, 3).index === 'bow') {
      this.target = {
        x: this.tileX,
        y: this.tileY
      }
      this.damage(targetActor);
    } else {
      let tile = this.map.getTileNameAt(x, y);
      if (tile && (
        this.walksOn.includes(tile) 
        || tile !== 'water' 
        && tile !== 'marsh' 
        && tile !== 'bush' 
        && tile !== 'tree' 
        && tile !== 'mountain'
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
    //this.layer.forEachTile(tile => tile.visible = false);
    //this.scene.itemLayer.forEachTile(tile => tile.visible = false);
    //enemies.forEach(enemy => enemy.visible = false);
    this.map.tiles.setAll('toHide', true);

    // find the currently visible tiles
    this.fov.compute(this.tileX, this.tileY, 13, function (x, y) {
      
      // show the visible tiles
      let tile = this.map.addTile(x, y);
      tile.setInteractive();
      tile.toHide = false;
      tile.on('pointerup', function () {
        player.orderTo(this.tileX, this.tileY);
      })
      tile.on('pointerover', function () {
        marker.x = this.x - 12;
        marker.y = this.y - 11;
      })

    }.bind(this));

    this.map.tiles.each(function (tile) {
      if (tile.toHide) {
        this.map.hide(tile);
      }
    }, this);
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
          x: this.map.tileToWorldX(this.path[0].x),
          y: this.map.tileToWorldY(this.path[0].y),
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
          x: this.map.tileToWorldX(this.path[0].x),
          y: this.map.tileToWorldY(this.path[0].y),
          ease: 'Quad.easeInOut',
          duration: 450 / game.speed,
          yoyo: true
        });
        this.damage(actor);
      }
    } else {
      this.tileX = this.path[0].x;
      this.tileY = this.path[0].y;
      if (this.isPlayer) {
        //this.scene.events.emit('playerMoved');
        console.log(player.name + ' moved to ' + this.tileX + ', ' + this.tileY);
      }
      this.scene.tweens.add({
        targets: this,
        x: this.tileX * 24 + 12,
        y: this.tileY * 21 + 11,
        ease: 'Quad.easeInOut',
        duration: 900 / game.speed
      });
      engine.unlock();
    }
  },
  rest: function () {
    this.health = Math.min(this.healthMax, this.health + 1);
    console.log(this.name, this.health);
    engine.unlock();
    this.scene.events.emit('updateAttribute', this);
  },
  damage: function (actor) {
    let damage = ROT.RNG.getUniformInt(1, 10)
    actor.health -= damage;
    if (actor === player) {
      this.scene.events.emit('playerDamaged');
    }
    this.scene.time.delayedCall(450 / game.speed, function () {
      let effect = this.scene.add.sprite(
        this.map.tileToWorldX(actor.tileX) + 12, 
        this.map.tileToWorldY(actor.tileY) + 11, 
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
    if (this.xp >= this.xpMax) {
      this.xp -= this.xpMax;
      this.xpMax *= 2;
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
      let tile = this.map.getTileNameAt(x, y);
      return tile && (
        this.walksOn.includes(tile) ||
        tile !== 'water' &&
        tile !== 'marsh' &&
        tile !== 'bush' &&
        tile !== 'tree' &&
        tile !== 'mountain'
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