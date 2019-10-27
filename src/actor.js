class Actor extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, frame) {
    super(scene, x * 24 + 12, y * 21 + 11, texture, frame);
    this.config = this.scene.actorTypes[frame];
    this.name = this.config.name;
    this.tileX = x;
    this.tileY = y;
    this.tileName = frame;
    this.target = {
      x: this.tileX,
      y: this.tileY
    }
    this.path = null;      
    this.speed = this.config.speed;
    this.xp = 0;
    this.xpMax = 50;
    this.level = 0;
    this.health = this.config.health;
    this.healthMax = this.health;
    this.mana = this.config.mana;
    this.manaMax = this.mana;
    this.strength = this.config.strength;    
    this.strengthBase = this.strength;  
    this.strengthMod = 0;  
    this.agility = this.config.agility;
    this.agilityBase = this.agility;
    this.agilityMod = 0;
    this.wisdom = this.config.wisdom;
    this.wisdomBase = this.wisdom;
    this.wisdomMod = 0;
    this.walksOn = this.config.walksOn || [];
    this.damage = 1 + (this.strength >> 2);
    this.damageMax = this.damage + 19;
    this.chanceToHit = 0;
    this.usedWeapons = 0;
    this.defense = 0;
    this.inventory = [];
    this.initInventory();
    this.equipped = {};
    this.ground = [];
    this.load = 0;
    this.updateAttributes();
    this.scene.add.existing(this);
    this.scene.scheduler.add(this, true);
    this.depth = 3;
  }

  initInventory() {
    this.config.inventory.forEach(function (itemName) {
      let item = this.scene.itemTypes[itemName];
      item.frame = itemName;
      this.inventory.push(item);
    }.bind(this));
  }

  // The act is getting called by the scheduler every time when this actor is the next to act.
  act() {
    
    this.getGround();

    this.autoEquip();

    // If the actor hasn't reached his target yet because that's further than one step away and additional actions are needed to be performed automatically.
    if (!this.isAtXY(this.target.x, this.target.y)) {

      // Make him move towards his target or attack from afar if possible.
      this.order();
    }
  }

  getGround() {

    if (!this.scene.map.tiles[this.tileX + ',' + this.tileY]) {
      return [];
    }

    // If the there are already items on the ground at the player's current position, set their list as the ground to be displayed on the UI.
    this.ground = this.scene.map.tiles[this.tileX + ',' + this.tileY].itemList 
      || [];
  }

  autoEquip() {
    if (this.inventory) {
      this.inventory.forEach(function (item, i) {
        if (item 
          && !this.equipped.rightHand
          && (item.equips === 'hands' 
          || item.equips === 'hand')) {
            this.equipped.rightHand = item;
            this.inventory[i] = null;
        }
      }.bind(this));
    }
  }

  setItem(item, slot, i) {
    slot[i] = item;
    this.updateAttributes();
    if (slot === this.ground) {
      if (slot.some(function (value) {
        return value;
      })) {        
        this.scene.map.putItem(this.tileX, this.tileY, slot);
      } else {
        this.scene.map.removeItem(this.tileX, this.tileY);
      }
    }
  }

  updateAttributes() {
    this.updateLoad();
    this.updateDamage();
    this.updateDefense();
    this.updateAgility();

    // Emit the GUI update just in case the target is the player.
    this.scene.events.emit('attributesUpdated', this);
  }

  updateLoad() {
    this.load = 0;
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        this.load += this.equipped[item].weight || 0;
      }
    }.bind(this));
    this.inventory.forEach(function (item) {
      if (item) {
        this.load += item.weight || 0;
      }
    }.bind(this));
  }

  updateDamage() {
    this.damage = 0;
    this.usedWeapons = 0;
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        if (this.equipped[item].damage) {
          this.usedWeapons += 1;
          this.damage += this.equipped[item].damage;
          this.damage += this.strength >> 2;
        }
      }
    }.bind(this));
    if (this.usedWeapons === 0) {
      this.damage = 1 + (this.strength >> 2);
      this.damageMax = this.damage + 19;
    } else {
      this.damage += this.usedWeapons;
      this.damageMax = this.damage + this.usedWeapons * 19;
    }
  }

  updateDefense() {
    this.defense = 0;
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        this.defense += this.equipped[item].defense || 0;
      }
    }.bind(this));
  }

  updateAgility() {
    this.agilityMod = 0;
    if (this.usedWeapons === 2) {
      this.agilityMod -= 5;
    }
    this.agility = this.agilityBase + this.agilityMod;
    this.chanceToHit = (this.agility * 5) + '%';
  }

  order() {
    if (this.isEquippedForRangedAttack()) {
      let actor = this.scene.getActorAt(this.target.x, this.target.y);
      if (actor 
        && this.isEnemyFor(actor)
        && (Math.abs(this.target.x - this.tileX) > 1
        || Math.abs(this.target.y - this.tileY) > 1)) {
        this.rangedAttack(actor);
        this.target = {
          x: this.tileX,
          y: this.tileY
        }
      } else {
        this.move();
      }
    } else {
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

  isEquippedForRangedAttack() {
    let leftHand = this.equipped.leftHand;
    let rightHand = this.equipped.rightHand;
    if (leftHand && leftHand.usesArrow 
      || rightHand && rightHand.usesArrow
      || leftHand && leftHand.throwable
      || rightHand && rightHand.throwable) {
      return true;
    }
    return false;
  }

  isEnemyFor(actor) {
    return this.scene.enemies.includes(this) 
    === !this.scene.enemies.includes(actor)
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
    if (!this.path || this.path.length < 2) {

      // Calculate a new path for the actor towards his new target.
      this.addPath(this.target.x, this.target.y);
    }

    // Remove the first element of the path because that's the actor's current position.
    this.path.shift();

    // Get any actor at the previously second, now first element of the path, that will be the next step of this actor.
    let actor = this.scene.getActorAt(this.path[0].x, this.path[0].y);

    // If there is an actor at the next step. 
    if (actor) {

      // If that actor is in a different team, the moving actor will damage his victim.
      if (this.isEnemyFor(actor)) {

        // Damage that actor.
        this.causeDamage(actor);

        // Set the current position of the actor as his current target to prevent him attacking the enemy automatically as his next actions.
        this.target = {
          x: this.tileX,
          y: this.tileY
        };

        // Set the enemy as the current victim of the actor so the attack animation can be targetted correctly.
        this.victimX = this.path[0].x;
        this.victimY = this.path[0].y;

        // Reset his path and let him decide about his next action.
        this.path = [];

        // Add the actor to the list of attacking actors so he can be properly animated as part of the next screen update.
        this.scene.attackingActors.push(this);
      
      // If that actor is in the same team, this will be only a friendly bump, that still counts as a valid action so this actor can be skipped.
      } else {

        // Stop the blocked actor.
        this.target = {
          x: this.tileX,
          y: this.tileY
        };

        // Reset his path and let him recalculate it as his next action.
        this.path = [];
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

  // Decrease the current health of the target actor.
  causeDamage(actor) {

    let hit = ROT.RNG.getUniformInt(1, 20);
    if (hit > 1 && hit > this.agility) {
      return;
    }

    // Generate a random damage.
    let damage = this.damage + ROT.RNG.getUniformInt(1, 20);

    // Increase the damage with a bit shifted strength.
    damage += this.strength >> 2;

    // Decrease the damage with the victim's defense.
    damage = Math.max(damage - actor.defense, 0);

    if (damage === 0) {
      return;
    }

    // Decrease the health of the target actor with the remaining damage.
    actor.health -= damage;

    // Add a new effect to the list of effects to be displayed during this update based on the amount of damage.
    let effect = this.scene.add.sprite(
      actor.x, actor.y, 'tiles', damage > 9 ? 'zok' : 'bif'
    );
    effect.actor = actor;
    effect.depth = 4;
    effect.visible = false;
    this.scene.effects.push(effect);
    
    console.log(actor.name, actor.health);

    // If the target actor's health reached zero.
    if (actor.health < 1) {

      // Kill the actor.
      actor.die();
    }

    // Emit the GUI update just in case the target is the player.
    this.scene.events.emit('updateAttribute', this);
  }

  rangedAttack(actor) {

    // Damage that actor.
    this.causeDamage(actor);
    let leftHand = this.equipped.leftHand;
    let rightHand = this.equipped.rightHand;
    if (leftHand && leftHand.throwable) {
      if (rightHand && rightHand.throwable) {
        this.causeDamage(actor);
      }
      this.equipped.leftHand = undefined;  
      this.scene.map.addItem(actor.tileX, actor.tileY, [leftHand]);
    }
    if (rightHand && rightHand.throwable) {
      this.equipped.rightHand = undefined;
      this.scene.map.addItem(actor.tileX, actor.tileY, [rightHand]);
    }

    // Emit the GUI ground update just in case the target is the player.
    this.scene.events.emit('playerMoved', this);
  }

  // Kill this actor.
  die() {

    // Give some XP to the player.
    this.scene.player.earnXP(10);
    if (this.equipped) {
      for (let i in this.equipped) {
        this.inventory.push(this.equipped[i]);
      }      
    }
    this.inventory = this.inventory.filter(item => item !== null);
    if (this.inventory) {
      this.scene.map.addItem(this.tileX, this.tileY, this.inventory);
    }

    // Show the remains of the enemy.
    let remains = 
      this.scene.add.sprite(this.x, this.y, 'tiles', this.tileName);

    // Wait until the damage effect is emitted
    this.scene.time.delayedCall(500 / game.speed, function () {

      // Destroy the remains.
      remains.destroy();
    });

    console.log(this.name, 'died');

    // Remove the enemy from the list of enemies.
    this.scene.enemies.splice(this.scene.enemies.indexOf(this), 1);

    // Remove the enemy from the sceduler.
    this.scene.scheduler.remove(this);

    // Destroy the enemy.
    this.destroy();
  }
}