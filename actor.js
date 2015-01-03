/*global RM, ROT*/

RM.Actor = function (type, x, y, ai) {
  'use strict';
  RM.scheduler.add(this, true);
  this.x = x;
  this.y = y;
  this.ai = ai;
  this.fov = {};
  this.target = {};
  this.newTarget = {};
  this.path = [];
  this.level = 0;
  this.xp = 0;
  this.maxHealth = type.health;
  this.health = type.health;
  this.maxMana = type.mana;
  this.mana = type.mana;
  this.strength = type.strength;
  this.wisdom = type.wisdom;
  this.agility = type.agility;
  this.precision = type.precision;
  this.items = type.items;
};

RM.Actor.prototype.act = function () {
  'use strict';
  this.regenerate();
  if (this.ai) {
    this.computeFOV();
    this.moveTo(this.target);
  } else {
    RM.engine.lock();
    RM.subscribe('click', this);
    this.showFOV();
  }
};

RM.Actor.prototype.regenerate = function () {
  'use strict';
  this.heal(1 / this.agility);
};

RM.Actor.prototype.heal = function (amount) {
  'use strict';
  this.health = Math.min(this.maxHealth, this.health + amount);
};

RM.Actor.prototype.showFOV = function () {
  'use strict';
  RM.mapFrame.center(this.x, this.y);
  RM.mapFrame.fill(RM.terrains.invisible);
  RM.map.shadowcasting.compute(this.x, this.y, 10,
                               RM.mapFrame.show.bind(RM.mapFrame));
};

RM.Actor.prototype.computeFOV = function () {
  'use strict';
  RM.map.shadowcasting.compute(this.x, this.y, 10, function (x, y) {

    /**
     * Updates target if the actor didn't found a new target yet.
     */
    if (!this.newTarget) {

      /*
       * Updates target if the actor found a player to attack.
       */
      if (RM.isPlayer(x, y)) {
        this.newTarget = {
          x: x,
          y: y
        };
      }
    }
  }.bind(this));

  /*
   * Updates target if the actor found a new one.
   */
  if (this.newTarget) {
    this.target = this.newTarget;
  }
};

RM.Actor.prototype.moveTo = function (target) {
  'use strict';
  var x, y, enemy, damage, i;
  if (target) {
    return false;
  }
  this.computePath(target.x, target.y);
  x = this.path[1][0];
  y = this.path[1][1];
  RM.scheduler.setDuration(1.0 / this.agility);
  enemy = RM.getActor(x, y);
  if (enemy) {
    enemy.damage(this);
    this.gainXP(1);
  } else {
    RM.map[this.x][this.y].actor = null;
    this.x = x;
    this.y = y;
    RM.map[this.x][this.y].actor = this;
  }
};

RM.Actor.prototype.computePath = function (x, y) {
  'use strict';
  var a = new ROT.Path.AStar(x, y, function (x, y) {
    var actor = RM.map.getActor(x, y);
    if (RM.map.isPassable(x, y)) {
      if (actor) {
        if (actor === this) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }.bind(this));
  this.path = [];
  a.compute(this.x, this.y, function (x, y) {
    this.path.push([x, y]);
  }.bind(this));
};

RM.Actor.prototype.damage = function (source) {
  'use strict';
  var damage = ROT.RNG.getUniformInt(1, 6);
  if (damage === 6) {
    damage += 6;
  }
  if (source.primary !== undefined && source.items !== undefined) {
    damage += source.damage;
  }
  this.health -= damage;
  if (this.health < 1) {
    if (!this.ai) {
      RM.engine.lock();
      RM.c.drawImage(RM.gameover, 0, 0);
      RM.canvas.addEventListener('click', RM.start);
    }
    RM.scheduler.remove(this);
    RM.map[this.x][this.y].actor = null;
    this.gainXP(2);
  }
};

RM.Actor.prototype.gainXP = function (amount) {
  'use strict';
  this.xp += amount;
  if (this.xp > 50 * Math.pow(2, this.level)) {
    this.xp = 0;
    this.level += 1;
    this.maxHealth += 10;
    this.maxMana += this.maxMana ? 10 : 0;
    this.health += 10;
    this.mana += this.maxMana ? 10 : 0;
  }
};

RM.Actor.prototype.handleMessage = function (message, publisher, data) {
  'use strict';
  switch (message) {
  case 'click':
    switch (publisher.id) {
    case 'map':
      this.order(data);
      break;
    }
    break;
  }
};

RM.Actor.prototype.order = function (target) {
  'use strict';
  if (!RM.isPassable(target.x, target.y)) {
    return false;
  }
  if (RM.getActor(target.x, target.y) === this) {
    /* rest */
    RM.scheduler.setDuration(1.0 / this.agility);
    this.regenerate();
    return true;
  }
  RM.moveTo(target);
  RM.unsubscribe('click', this);
  RM.unsubscribe('mousemove', this);
  RM.engine.unlock();
};
