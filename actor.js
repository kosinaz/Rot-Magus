/*global RM, ROT*/

RM.Actor = function (type, x, y, ai) {
  'use strict';
  var i;
  RM.scheduler.add(this, true);
  this.tx = type.x;
  this.ty = type.y;
  this.x = x;
  this.y = y;
  this.ai = ai;
  this.fov = {};
  this.target = '';
  this.targets = [];
  this.paths = [];
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
  this.burden = 0;
  if (this.items) {
    for (i = 0; i < this.items.length; i += 1) {
      this.burden += RM.items[this.items[i]].weight;
    }
  }
  this.selected = null;
};

RM.Actor.prototype.act = function () {
  'use strict';
  var i, path;
  this.paths = [];
  this.computeFOV();
  this.health = Math.min(this.maxHealth, this.health + 1 / this.agility);
  if (this.ai) {
    /* if there isn't any enemy, hold position */
    if (this.targets.length > 0) {
      for (i = 0; i < this.targets.length; i += 1) {
        this.computePath(this.targets[i].x, this.targets[i].y);
      }
      path = this.getShortest(this.paths);
      if (path[1]) {
        this.moveTo(path[1][0], path[1][1]);
      }
    }
  } else {
    RM.drawFOV(this);
    RM.drawHUD(this);
    RM.engine.lock();
    RM.map.addClickListener(this.moveTo);
    RM.canvas.addEventListener('mousemove', this);
  }
};

RM.Actor.prototype.moveTo = function (targetX, targetY) {
  'use strict';
  var x, y, enemy, damage, i;
  if (RM.getActor(targetX, targetY) === this) {
    /* rest */
    RM.scheduler.setDuration(1.0 / this.agility);
    this.health = Math.min(this.maxHealth, this.health + 1);
    return true;
  }
  if (!RM.isPassable(targetX, targetY)) {
    return false;
  }
  this.computePath(targetX, targetY);
  x = this.path[1][0];
  y = this.path[1][1];
  RM.scheduler.setDuration(1.0 / this.agility);
  enemy = RM.getActor(x, y);
  if (enemy) {
    damage = ROT.RNG.getUniformInt(1, 6);
    damage += damage === 6 ? 6 : 0;
    if (this.primary !== undefined &&
        this.items !== undefined) {
      i = RM.items[this.items[this.primary]];
      damage += i.melee ? i.damage : 0;
    }
    enemy.health -= damage;
    this.xp += 1;
    if (enemy.health < 1) {
      if (!enemy.ai) {
        RM.engine.lock();
        RM.c.drawImage(RM.gameover, 0, 0);
        RM.canvas.addEventListener('click', RM.start);
      }
      RM.scheduler.remove(enemy);
      RM.map[enemy.x][enemy.y].actor = null;
      RM.enemy = null;
      this.xp += 2;
    }
    if (this.xp > 50 * Math.pow(2, this.level)) {
      this.xp = 0;
      this.level += 1;
      this.maxHealth += 10;
      this.maxMana += this.maxMana ? 10 : 0;
      this.health += 10;
      this.mana += this.maxMana ? 10 : 0;
    }
  } else {
    RM.map[this.x][this.y].actor = null;
    this.x = x;
    this.y = y;
    RM.map[this.x][this.y].actor = this;
  }
};

RM.Actor.prototype.computeFOV = function () {
  'use strict';
  var ps = new ROT.FOV.PreciseShadowcasting(function (x, y) {
    return RM.isTransparent(x, y);
  }.bind(this));
  this.fov = {};
  this.targets = [];
  ps.compute(this.x, this.y, 10, function (x, y) {
    var actor = RM.getActor(x, y);
    this.fov[x + ',' + y] = [x, y];
    if (actor && (actor.ai !== this.ai)) {
      this.targets.push(actor);
    }
  }.bind(this));
};

RM.Actor.prototype.computePath = function (x, y) {
  'use strict';
  var a = new ROT.Path.AStar(x, y, function (x, y) {
    var actor = RM.getActor(x, y);
    if (RM.isPassable(x, y)) {
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

RM.Actor.prototype.getShortest = function (paths) {
  'use strict';
  var i, shortest;
  shortest = paths[0];
  for (i = 1; i < paths.length; i += 1) {
    shortest = shortest.length < paths[i].length ? shortest : paths[i];
  }
  return shortest;
};
