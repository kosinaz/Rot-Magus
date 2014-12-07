/*global ROT, ROTMAGUS*/
ROTMAGUS.prototype.Map = function () {
  'use strict';
  var x, y, cells;
  for (x = -10; x < 11; x += 1) {
    for (y = -10; y < 11; y += 1) {
      cells[x + ',' + y] = this.generateCell();
    }
  }
  cells['0, 0'] = {
    terrain: ROTMAGUS.TERRAINS.grass,
    actor: new ROTMAGUS.Actor('elf')
  };
};
ROTMAGUS.Map.prototype = new ROTMAGUS.Subject();

ROTMAGUS.Map.prototype.generateCell = function () {
  'use strict';
  var r = ROT.RNG.getPercentage();
  if (r < 1) {
    return {
      terrain: ROTMAGUS.TERRAINS.grass,
      actor: new ROTMAGUS.Actor('skeleton')
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
        this.cells[x1 + ',' +y1].passable) {
      this.cells[x1 + ',' +y1].actor = this.cells[x0 + ',' +y0].actor;
      this.cells[x0 + ',' +y0].actor = null;
      this.notify('moved');
    }
    break;
  }
};

ROTMAGUS.Map.prototype.getPosition = function (entity) {
  'use strict';
  var cell;
  for (cell in this.cells) {
    if (this.cells[cell] === entity) {
      return cell.split(',');
    }
  }
};
