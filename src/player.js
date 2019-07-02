class Player extends Actor {
  constructor(scene, x, y, texture, config) {
    super(
      scene, 
      x, 
      y, 
      texture,
      config,
    );
    this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);
  }

  // The act is getting called by the scheduler every time when this actor is 
  // the next to act.
  act() {

    // The first step is to lock the engine before it calls the next actor,
    // so the screen can be updated and the player can have plenty of time to
    // perform his next action. 
    // The engine needs to be locked even if the player's actor has a target
    // and does not need additional orders, because every action takes time
    // and no one should move in the meantime.
    this.scene.engine.lock();

    // Determine what is visible for the player. Collect the tiles, actors and items to show, to keep as visible and to hide. Make the visible enemies notice the player.
    this.scene.calculateFOVforXY();

    // Update the FOV in a speed-based amount of time to show the player what happened since his last action.
    this.scene.updateFOV();

    // if the actor hasn't reached his target yet
    if (!this.isAtXY(this.target.x, this.target.y)) {

      // make him move towards his target
      this.move();
    }
  }

  // this function is required for the Speed scheduler to determine the sequence
  // of actor actions
  getSpeed() {

    // return the speed of the actor
    return this.speed;
  }

  // return if the target tile is walkable by the actor
  walksOnXY(x, y) {

    // get the tile at the given position
    let tile = this.scene.map.getTileNameAt(x, y);

    // return true if the actor can walk on it or if it is walkable by default
    return this.walksOn.includes(tile) || (
        tile !== 'water' &&
        tile !== 'marsh' &&
        tile !== 'bush' &&
        tile !== 'tree' &&
        tile !== 'mountain'
      );
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