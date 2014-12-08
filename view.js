/*global ROT, ROTMAGUS*/
ROTMAGUS.prototype.View = function () {
  'use strict';

  var tileSet, tileMap, terrain;
  tileSet = document.createElement('img');
  tileSet.src = 'tileset.png';
  tileMap = {};
  for (terrain in ROTMAGUS.TERRAINS) {
    tileMap[terrain.char] = [terrain.x, terrain.y];
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
ROTMAGUS.View.prototype = ROTMAGUS.Subject();

ROTMAGUS.View.prototype.onNotify = function (subject, note) {
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
  switch (e.type) {
  case 'click':
    this.notify('order', {
      from: this.getCenter(),
      to: this.display.eventToPosition(e)
    });
    break;
  }
};

ROTMAGUS.View.prototype.setCenter = function (position) {
  'use strict';
  this.x = position.split(',')[0] - 10;
  this.y = position.split(',')[1] - 10;
};

ROTMAGUS.View.prototype.show = function (cells) {
  'use strict';
  var i;
  for (i = 0; i < cells.length; i += 1) {
    this.display.draw(
      cells[i].x - this.x,
      cells[i].y - this.y,
      cells[i].char
    );
  }
};


