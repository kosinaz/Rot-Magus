class Actor extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, config) {
    super(
      scene, 
      x * 24 + 12, 
      y * 21 + 11, 
      texture, 
      config.tileName
    );
    this.name = config.name;
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
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.scheduler.add(this, true);
  }

  // The act is getting called by the scheduler every time when this actor is the next to act.
  act() {

    // If the actor hasn't reached his target yet because that's further than one step away and additional actions are needed to be performed automatically.
    if (!this.isAtXY(this.target.x, this.target.y)) {

      // Make him move towards his target.
      this.move();
    }
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

    // Return true if the actor is able to walk on that type of tiles or if it is generally walkable by every actor.
    return this.walksOn.includes(tile) || (
      tile !== 'water' &&
      tile !== 'marsh' &&
      tile !== 'bush' &&
      tile !== 'tree' &&
      tile !== 'mountain'
    );
  }

  // Calculate the shortest path between the actor's current position and the given target position.
  addPath(x, y) {

    // Initialize a new astar pathmap based on the given target.
    let a = new ROT.Path.AStar(x, y, this.walksOnXY.bind(this));

    // After generated the pathmap create a new path for the actor.
    this.path = [];

    // Compute the shortest path between the actor's current position and the given target position based on the astar map.
    a.compute(this.tileX, this.tileY, function (x, y) {

      // Add the next position of the shortest path to the actor's path.
      this.path.push({
        x: x,
        y: y
      });
    }.bind(this));
  }

  // Check if the actor is at the given position.
  isAtXY(x, y) {

    // Return true if the actor's tileX and tileY attributes are matching with the given x and y values.
    return this.tileX === x && this.tileY === y;
  }

  // Order the actor to move towards the specified position or make him rest if it is the actor's current position. This action can be called during every action of the actor before he reaches his destination.
  move() {

    // If the actor has been ordered to move to his current position that means the actor would like to have some rest. This action can't be reached as part of a continues movement towards a target further away, since that option has been already handled as part of the act function, and this function can be reached from there only if the actor is not standing at the target position.
    if (this.isAtXY(this.target.x, this.target.y)) {

      // Make the actor rest until his next action and get back a health point.
      this.rest();

      // Since the actor only wanted to rest there is no need for further actions.
      return;
    }

    // If the actor has been ordered to a different position and just started to move towards that position there can't be an already calculated path for him. Or if the actor just arrived to its destination during his last action, the last step will be still there as the last remaining element of the path, and that will be the actor's current position. That path can be ignored and no further automatic action should be performed. So in both cases this part of the code has been reached because the actor has been given a new order.
    if (!this.path || this.path.length === 1) {

      // Calculate a new path for the actor towards his new target.
      this.addPath(this.target.x, this.target.y);
    }

    // Remove the first element of the path because that's the actor's current position.
    this.path.shift();

    // Get any actor at the previously second, now first element of the path, that will be the next step of this actor.
    let actor = this.scene.getActorAt(this.path[0].x, this.path[0].y);

    // If there is an actor at the next step. 
    if (actor) {

      // If that actor is in the same team, this will be only a friendly bump, that still counts as a valid action so this actor can be skipped, but if they are in different teams, they moving actor will damage his victim.
      if (
        this.scene.enemies.includes(this) && 
        !this.scene.enemies.includes(actor)) {

        // Damage that actor.
        this.damage(actor);

        // Set the current position of the actor as his current target to prevent him attacking the enemy automatically as his next actions.
        this.target = {
          x: this.tileX,
          y: this.tileY
        };

        // Set the enemy as the current victim of the actor so the attack animation can be targetted correctly.
        this.victimX = this.path[0].x;
        this.victimY = this.path[0].y;

        // Add the actor to the list of attacking actors so he can be properly animated as part of the next screen update.
        this.scene.attackingActors.push(this);
      }

    // If there isn't any actor in the way of the actor.
    } else {

      // Move the actor.
      this.tileX = this.path[0].x;
      this.tileY = this.path[0].y;

      // Add the actor to the list of moving actors so he can be properly animated as part of the next screen update.
      this.scene.movingActors.push(this);
    }
  }

  // Make the actor rest until the his next action and get back a health point.
  rest() {

    // If the actor's health did not reach the maximum yet.
    if (this.health < this.healthMax) {

      // Make the actor get back one health point. 
      this.health += 1;
    }
  }
  damage(actor) {
    let damage = ROT.RNG.getUniformInt(1, 10)
    actor.health -= damage;
    if (actor === this.scene.player) {
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