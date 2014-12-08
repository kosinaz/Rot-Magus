/*global ROT, ROTMAGUS*/
ROTMAGUS.prototype.Map = function () {
  'use strict';
  var x, y, cells, adventurer;
  this.fov = [];
  this.scheduler = new ROT.Scheduler.Action();
  this.engine = new ROT.Engine(this.scheduler);
  for (x = -10; x < 11; x += 1) {
    for (y = -10; y < 11; y += 1) {
      cells[x + ',' + y] = this.generateCell();
    }
  }
  adventurer = new ROTMAGUS.Actor('elf');
  adventurer.addObserver(this);
  this.scheduler.add(adventurer, true);
  cells['0, 0'] = {
    terrain: ROTMAGUS.TERRAINS.grass,
    actor: adventurer
  };
  this.engine.start();
};
ROTMAGUS.Map.prototype = new ROTMAGUS.Subject();

ROTMAGUS.Map.prototype.generateCell = function () {
  'use strict';
  var r, monster;
  r = ROT.RNG.getPercentage();
  if (r < 1) {
    monster = new ROTMAGUS.Actor('skeleton','guard');
    monster.addObserver(this);
    this.scheduler.add(monster, true);
    return {
      terrain: ROTMAGUS.TERRAINS.grass,
      actor: monster
    };
  }
  if (r < 50) {
    return {
      terrain: ROTMAGUS.TERRAINS.grass
    };
  }
  if (r < 60) {
    return {
      terrain: ROTMAGUS.TERRAINS.redFlower
    };
  }
  if (r < 70) {
    return {
      terrain: ROTMAGUS.TERRAINS.yellowFlower
    };
  }
  if (r < 80) {
    return {
      terrain: ROTMAGUS.TERRAINS.bush
    };
  }
  return {
    terrain: ROTMAGUS.TERRAINS.tree
  };
};

ROTMAGUS.Map.prototype.onNotify = function (note, subject) {
  'use strict';
  var position, x0, y0, x1, y1, xn, yn;
  switch (note) {
  case 'active':
    if (!subject.ai) {
      position = this.getPosition(subject);
      this.notify('show', {
        center: position,
        cells: this.getFOV(position)
      });
      this.engine.lock();
    }
    break;
  case 'order':
    x0 = subject.from[0];
    y0 = subject.from[1];
    xn = subject.to[0];
    yn = subject.to[1];
    x1 = x0 + (xn > x0 ? 1 : (x0 > xn ? -1 : 0));
    y1 = y0 + (yn > y0 ? 1 : (y0 > yn ? -1 : 0));
    if (!this.cells[x1 + ',' +y1].actor &&
        this.cells[x1 + ',' +y1].terrain.passable) {
      this.cells[x1 + ',' +y1].actor = this.cells[x0 + ',' +y0].actor;
      this.cells[x0 + ',' +y0].actor = null;
      this.engine.unlock();
    }
    break;
  }
};

ROTMAGUS.Map.prototype.getPosition = function (entity) {
  'use strict';
  var cell;
  for (cell in this.cells) {
    if (this.cells[cell] === entity) {
      return cell;
    }
  }
};

ROTMAGUS.Map.prototype.getFOV = function (position) {
  'use strict';
  var ps, x, y, char;
  ps = new ROT.FOV.PreciseShadowcasting(function (x, y) {
    if(this.cells[position].terrain) {
      return this.cells[position].terrain.transparent;
    }
    return true;
  }.bind(this));
  x = position.split(',')[0];
  y = position.split(',')[1];
  this.fov = [];
  ps.compute(x, y, 10, function(x, y) {
    if (this.cells[x + ',' + y].terrain.transparent) {
      if (this.cells[x + ',' + y].actor) {
        char = this.cells[x + ',' + y].actor.char;
      } else {
        char = this.cells[x + ',' + y].terrain.char;
      }
      this.fov.push({
        x: x,
        y: y,
        char: char
      });
    }
  }.bind(this));
  return this.fov;
};
