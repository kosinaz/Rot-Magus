/*global ROT, ROTMAGUS*/
ROTMAGUS.View = function () {
  'use strict';

  var tileSet, tileMap, terrain, actor;
  tileSet = document.createElement('img');
  tileSet.src = 'tileset.png';
  tileMap = {};
  for (terrain in ROTMAGUS.TERRAINS) {
    if (ROTMAGUS.TERRAINS.hasOwnProperty(terrain)) {
      tileMap[ROTMAGUS.TERRAINS[terrain].char] = [
        ROTMAGUS.TERRAINS[terrain].x,
        ROTMAGUS.TERRAINS[terrain].y];
    }
  }
  for (actor in ROTMAGUS.ACTORS) {
    if (ROTMAGUS.ACTORS.hasOwnProperty(actor)) {
      tileMap[ROTMAGUS.ACTORS[actor].char] = [
        ROTMAGUS.ACTORS[actor].x,
        ROTMAGUS.ACTORS[actor].y];
    }
  }

  /** @private */
  this.display = new ROT.Display({
    width: 21,
    height: 21,
    layout: 'tile',
    tileWidth: 24,
    tileHeight: 21,
    tileSet: tileSet,
    tileMap: tileMap
  });

  document.body.appendChild(this.display.getContainer());

};
ROTMAGUS.View.prototype = new ROTMAGUS.Subject();

ROTMAGUS.View.prototype.onNotify = function (note, subject) {
  'use strict';
  switch (note) {
  case 'show':
    this.setCenter(subject.center);
    this.show(subject.cells);
    window.addEventListener('click', this);
    window.addEventListener('mousemove', this);
    break;
  }
};

ROTMAGUS.View.prototype.handleEvent = function (e) {
  'use strict';
  var x, y;
  switch (e.type) {
  case 'click':
    x = this.display.eventToPosition(e)[0] + this.x;
    y = this.display.eventToPosition(e)[1] + this.y;
    this.notify('order', {
      from: this.getCenter(),
      to: x + ',' + y
    });
    break;
  }
};

ROTMAGUS.View.prototype.setCenter = function (position) {
  'use strict';
  this.x = parseInt(position.split(',')[0], 10) - 10;
  this.y = parseInt(position.split(',')[1], 10) - 10;
};

ROTMAGUS.View.prototype.getCenter = function () {
  'use strict';
  return (this.x + 10) + ',' + (this.y + 10);
};

ROTMAGUS.View.prototype.show = function (cells) {
  'use strict';
  var x, y, i;
  for (x = 0; x < 21; x += 1) {
    for (y = 0; y < 21; y += 1) {
      this.display.draw(x, y, '');
    }
  }
  for (i = 0; i < cells.length; i += 1) {
    this.display.draw(
      cells[i].x - this.x,
      cells[i].y - this.y,
      cells[i].char
    );
  }
};


