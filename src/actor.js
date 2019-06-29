class Actor extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, map, config) {
    super(
      scene, 
      x * 24 + 12, 
      y * 21 + 11, 
      texture, 
      config.tileName
    );
    this.map = map;
    this.name = config.name;
    this.isPlayer = config.player;
    this.tileX = x;
    this.tileY = y;
    this.tileName = config.tileName;
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
    this.walksOn = config.walksOn || [];
    this.fov = scene.fov;
    this.noise = scene.noise;
    this.scene = scene;
    this.gui = this.scene.scene.get('GUIScene');
    scene.add.existing(this);
    scheduler.add(this, true);
    if (this.isPlayer) {
      this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);
    }
  }
  act() {

    // if the actor is controlled by the player
    if (this.isPlayer) {

      // the engine needs to be locked, even if the player has a target and does
      // not need additional orders, because every action takes time, and no one
      // should move in the meantime
      engine.lock();

      // the player should not accept orders while the actors are in motion
      isAcceptingOrders = false;

      // as the result of his last action the player's position is already 
      // updated, but the image of the player will be moved to its new position
      // paralelly with all the other actors
      // the time delay - calculated from the game speed - is there to let all
      // the animation finish before the next move
      this.scene.time.delayedCall(1000 / game.speed, function () {

        // when every actor has arrived the field of view of the player will be
        // calculated and then displayed
        this.showFOV();

        // if the actor has reached his target
        if (this.isAtXY(this.target.x, this.target.y)) {
          
          // reset his path of movement
          this.path = null;

          // start accepting orders
          isAcceptingOrders = true;

        // if the actor hasn't reached his target yet
        } else {

          // make him move towards his target
          this.move();
        }
      }, undefined, this);

    // if the actor isn't controlled by the player
    } else {

      // the engine needs to be locked the same way as it would in case of an
      // actor controlled by the player because the move function ends with an
      // engine unlock
      engine.lock();

      // if the actor has reached his target
      if (this.isAtXY(this.target.x, this.target.y)) {

        // reset his path of movement
        this.path = null;

        // unlock the engine and continue without finding a new target
        engine.unlock();

      // if the actor hasn't reached his target yet
      } else {

        // make him move towards his target
        this.move();
      }
    }
  }

  // this function is required for the Speed scheduler to determine the sequence
  // of actor actions
  getSpeed() {

    // return the speed of the actor
    return this.speed;
  }

  // orderTo: function (x, y) {
  //   if (!isAcceptingOrders) {
  //     return;
  //   }
  //   if (this.isAtXY(x, y)) {
  //     this.rest();
  //     return;
  //   }
  //   let targetActor = this.getActorAt(x, y);
  //   if (targetActor &&
  //     this.gui.inventory &&
  //     this.gui.inventory.getTileAt(6, 3) &&
  //     this.gui.inventory.getTileAt(6, 3).index === 'bow') {
  //     this.target = {
  //       x: this.tileX,
  //       y: this.tileY
  //     }
  //     this.damage(targetActor);
  //   } else {
  //     let tile = this.map.getTileNameAt(x, y);
  //     if (tile && (
  //       this.walksOn.includes(tile) 
  //       || tile !== 'water' 
  //       && tile !== 'marsh' 
  //       && tile !== 'bush' 
  //       && tile !== 'tree' 
  //       && tile !== 'mountain'
  //     )) {
  //       this.target = {
  //         x: x,
  //         y: y
  //       };
  //       this.move();
  //     }
  //   }
  // },

  // return if the target tile is walkable by the actor
  walksOnXY(x, y) {

    // get the tile at the given position
    let tile = this.map.getTileNameAt(x, y);

    // return true if the actor can walk on it or if it is walkable by default
    return this.walksOn.includes(tile) || (
        tile !== 'water' &&
        tile !== 'marsh' &&
        tile !== 'bush' &&
        tile !== 'tree' &&
        tile !== 'mountain'
      )
  }

  // show the current field of view of the player
  showFOV() {
    
    // hide all items
    //this.scene.itemLayer.forEachTile(tile => tile.visible = false);

    // hide all enemies
    enemies.forEach(enemy => enemy.visible = false);

    // set all tiles to be hidden by default
    this.map.tiles.setAll('toHide', true);

    // find the currently visible tiles
    this.fov.compute(this.tileX, this.tileY, 13, function (x, y) {
      
      // show the visible tiles
      let tile = this.map.addTile(x, y);

      // make sure that the tile won't be hidden after the FOV calculations
      tile.toHide = false;

      // if the actor can walk on the tile
      if (this.walksOnXY(x, y)) {

        // set tile as a possible target of the player's next action
        tile.setInteractive();

        // if the player clicks on the tile
        tile.on('pointerup', function (a, b, c) {

          // set that tile as the new target of the player
          this.target.x = x;
          this.target.y = y;
          this.move();
        }, this);

        // if the player's pointer is over the tile
        tile.on('pointerover', function () {

          // move the marker over the tile
          marker.x = this.x - 12;
          marker.y = this.y - 11;
        });

        // get the enemy at the tile
        let enemy = this.getActorAt(x, y);

        // if there is an enemy at the tile
        if (enemy) {

          // show the enemy
          enemy.visible = true;

          // make the enemy target the player
          enemy.target = {
            x: this.tileX,
            y: this.tileY
          };
          console.log(enemy.name + ' target: ' + enemy.target.x + ', ' + enemy.target.y)
        }
      }

    }.bind(this));

    // iterate through all the currently visible tiles of the map
    this.map.tiles.each(function (tile) {

      // if the tile is not in the current FOV of the player
      if (tile.toHide) {

        // hide the tile that is not visible anymore
        this.map.hide(tile);
      }
    }, this);
  }

  move() {
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
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 450 / game.speed,
      ease: 'Quad.easeOut',
      yoyo: true
    });
    let actor = this.getActorAt(this.path[0].x, this.path[0].y);
    if (actor) {
      if (this.isPlayer) {
        this.scene.tweens.add({
          targets: this,
          x: this.tileX * 24 + 12,
          y: this.tileY * 21 + 11,
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
          x: this.tileX * 24 + 12,
          y: this.tileY * 21 + 11,
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
  }
  rest() {
    this.health = Math.min(this.healthMax, this.health + 1);
    console.log(this.name, this.health);
    engine.unlock();
    this.scene.events.emit('updateAttribute', this);
  }
  damage(actor) {
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
  }
  earnXP(amount) {
    this.xp += amount;
    if (this.xp >= this.xpMax) {
      this.xp -= this.xpMax;
      this.xpMax *= 2;
      this.level += 1;
    }
    this.scene.events.emit('updateAttribute', this);
  }
  die() {
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
  }
  addPath(x, y) {
    let a = new ROT.Path.AStar(x, y, function (x, y) {
      let tile = this.map.getTileNameAt(x, y);
      return tile 
        && (
          (this.walksOn && this.walksOn.includes(tile)) ||
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
    console.log(this.name + ' first step: ' + this.path[1].x + ', ' + this.path[1].y);
  }
  isAtXY(x, y) {
    return this.tileX === x && this.tileY === y;
  }
  getActorAt(x, y) {
    if (player.isAtXY(x, y)) {
      return player;
    }
    for (let i = 0; i < enemies.length; i += 1) {      
      if (enemies[i].isAtXY(x, y)) {
        return enemies[i];
      }
    }
  }
}