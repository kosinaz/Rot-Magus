class Player extends Actor {
  constructor(scene, x, y, texture, config) {
    super(
      scene, 
      x, 
      y, 
      texture,
      config,
    );

    // Make the camera follow the player.
    this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);
  }

  // The act is getting called by the scheduler every time when this actor is the next to act.
  act() {
    
    // The first step is to lock the engine before it calls the next actor, so the screen can be updated and the player can have plenty of time to perform his next action. The engine needs to be locked even if the player's actor has a target and does not need additional orders, because every action takes time and no one should move in the meantime.
    this.scene.engine.lock();
    
    // Determine what is visible for the player. Collect the tiles, actors and items to show, to keep as visible, and to hide. Make the visible enemies notice the player.
    this.scene.computeFOV();
    
    // Update the FOV in a speed-based amount of time to show the player what happened since his last action.
    this.scene.updateFOV();    
  }

  // Order the player to move towards the specified position or make him rest if it is the player's current position. This action can be called as a direct result of a click on a tile walkable by the player or during every upcoming action of the player before he reaches his destination.
  move() {

    // The player moves the same way as an actor, except the engine and the player moved event.
    super.move();

    // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor.
    this.scene.engine.unlock();

    // The scene should also emit an event that one of the player's attributes has been updated, and the ground section of the GUI should react to that.
    this.scene.events.emit('playerMoved', this);
  }

  // Make the player rest until the his next action and get back a health point.
  rest() {
    
    // The player rests the same way as an actor, except the update attribute event. Even if the player would have been already on full health, these steps were not skipped to let him wait for his enemy.
    super.rest();
    
    // The scene should also emit an event that one of the player's attributes has been updated, and the GUI should react to that.
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
}