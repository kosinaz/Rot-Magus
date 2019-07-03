class Player extends Actor {
  constructor(scene, x, y, texture, config) {
    super(
      scene, 
      x, 
      y, 
      texture,
      config,
    );
    this.health = 10;

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

  // This function is required for the Speed scheduler to determine the sequence of actor actions.
  getSpeed() {

    // Return the speed of the actor.
    return this.speed;
  }

  // Return true if the target tile is walkable by the actor. This is called by the calculate shortest path function and by the GUI when determining where the pointer marker can be displayed.
  walksOnXY(x, y) {

    // Get the tile name at the given position. The name of the tile is unique hence enough to determine its attributes including its walkabilty.
    let tile = this.scene.map.getTileNameAt(x, y);

    // Return true if the player is able to walk on that type of tiles or if it is generally walkable by every actor.
    return this.walksOn.includes(tile) || (
        tile !== 'water' &&
        tile !== 'marsh' &&
        tile !== 'bush' &&
        tile !== 'tree' &&
        tile !== 'mountain'
      );
  }

  // Order the player to move towards the specified position or make him rest if it is the player's current position. This action can be called as a direct result of a click on a tile walkable by the player or during every upcoming action of the player before he reaches his destination.
  move() {

    // If the player has been ordered to move to his current position that means the player would like to have some rest. This action can't be reached as part of a continues movement towards a target further away, since that option has been already handled as part of the act function, and this function can be reached from there only if the player is not standing at the target position.
    if (this.isAtXY(this.target.x, this.target.y)) {

      // Make the player rest until his next action and get back a health point.
      this.rest();

      // Since the player only wanted to rest there is no need for further actions.
      return;
    }
    
    // If the player has been ordered to a different position and just started to move towards that position there can't be an already calculated path for him. Or if the player just arrived to its destination during his last action, the last step will be still there, as the last remaining element of the path, and that will be the player's current position. That path can be ignored and no further automatic action should be performed. So in both cases this part of the code has been reached because the player gave a new order to his actor.
    if (!this.path || this.path.length === 1) {

      // Calculate a new path for the player towards his new target.
      this.addPath(this.target.x, this.target.y);
    }

    // Remove the first element of the path because that's the player's current position.
    this.path.shift();

    // Get the actor at the previously second, now first element of the path, that will be the next step of the player.
    let actor = this.getActorAt(this.path[0].x, this.path[0].y);

    // If there is an actor at the next step. 
    if (actor) {    
      
      // Damage that actor.
      this.damage(actor);

      // Set the current position of the player as his current target to prevent him attacking the enemy automatically as his next actions.
      this.target = {
        x: this.tileX,
        y: this.tileY
      };

      // Set the enemy as the current victim of the player so the attack animation can be targetted correctly.
      this.victimX = this.path[0].x;
      this.victimY = this.path[0].y;

      // Add the player to the list of attacking actors so he can be properly animated as part of the next screen update.
      this.scene.attackingActors.push(this);
    
    // If there isn't any actor in the way of the player.
    } else {

      // Move the player.
      this.tileX = this.path[0].x;
      this.tileY = this.path[0].y;

      // Add the player to the list of moving actors so he can be properly animated as part of the next screen update.
      this.scene.movingActors.push(this);

      // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor.
      this.scene.engine.unlock();

      // The scene should also emit an event that one of the player's attributes has been updated, and the ground section of the GUI should react to that.
      this.scene.events.emit('playerMoved', this);
    }
  }

  // Make the player rest until the his next action and get back a health point.
  rest() {

    // If the player's health did not reach the maximum yet.
    if (this.health < this.healthMax) {

      // Make the player get back one health point. 
      this.health += 1;

      // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor. If the player would have been already on full health, these steps were skipped, and the player would have been able to try something else as part of his current action.
      this.scene.engine.unlock();

      // The scene should also emit an event that one of the player's attributes has been updated, and the GUI should react to that.
      this.scene.events.emit('updateAttribute', this);
    }
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

  // Calculate the shortest path between the player's current position and the given target position.
  addPath(x, y) {

    // Initialize a new astar pathmap based on the given target.
    let a = new ROT.Path.AStar(x, y, this.walksOnXY.bind(this));

    // After generated the pathmap create a new path for the player.
    this.path = [];

    // Compute the shortest path between the player's current position and the given target position based on the astar map.
    a.compute(this.tileX, this.tileY, function (x, y) {

      // Add the next position of the shortest path to the player's path.
      this.path.push({
        x: x,
        y: y
      });
    }.bind(this));
  }

  // Check if the player is at the given position.
  isAtXY(x, y) {

    // Return true if the player's tileX and tileY attributes are matching with the given x and y values.
    return this.tileX === x && this.tileY === y;
  }

  // Get the actor at the given position if there is one.
  getActorAt(x, y) {

    // If the player is at the given position.
    if (this.isAtXY(x, y)) {

      // Return the player as the actor at the given position.
      return this;
    }

    // Else iterate through all the enemies.
    for (let i = 0; i < this.scene.enemies.length; i += 1) {
      
      // If that enemy is at the given position.
      if (this.scene.enemies[i].isAtXY(x, y)) {

        // Return that enemy as the actor at the given position and skip the remaining part of the search.
        return this.scene.enemies[i];
      }
    }
  }
}